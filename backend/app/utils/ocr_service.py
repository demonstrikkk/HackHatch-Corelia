import pytesseract
from PIL import Image
import io
import re
from typing import List, Dict, Any
import logging
import os
import platform

logger = logging.getLogger(__name__)

# Configure tesseract path for Windows
if platform.system() == 'Windows':
    # Common installation paths
    possible_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    ]
    for path in possible_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            logger.info(f"Tesseract found at: {path}")
            break

class OCRService:
    """
    OCR Service for extracting text and structured data from images
    Uses pytesseract for local OCR processing
    """
    
    @staticmethod
    async def process_image(image_bytes: bytes) -> Dict[str, Any]:
        """
        Process image bytes and extract text using OCR
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Dict containing extracted text and structured data
        """
        logger.info(f"Starting OCR processing on {len(image_bytes)} bytes")
        
        try:
            # Open image from bytes
            image = Image.open(io.BytesIO(image_bytes))
            logger.info(f"Image opened successfully: {image.size}, mode: {image.mode}")
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
                logger.info("Converted image to RGB")
            
            # Extract text using pytesseract
            logger.info("Calling pytesseract.image_to_string...")
            text = pytesseract.image_to_string(image)
            logger.info(f"Extracted text length: {len(text)} characters")
            logger.info(f"Text preview: {text[:200]}")
            
            # Get detailed data with bounding boxes
            logger.info("Getting detailed OCR data...")
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            
            # Parse into structured format
            lines = OCRService._extract_lines(data)
            logger.info(f"Extracted {len(lines)} lines")
            
            confidence = OCRService._calculate_average_confidence(data)
            logger.info(f"Average confidence: {confidence}")
            
            return {
                'success': True,
                'text': text,
                'lines': lines,
                'confidence': confidence
            }
            
        except Exception as e:
            logger.error(f"OCR Processing Error: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'text': '',
                'lines': [],
                'confidence': 0
            }
    
    @staticmethod
    def _extract_lines(data: Dict) -> List[Dict[str, Any]]:
        """Extract lines from OCR data"""
        lines = []
        n_boxes = len(data['text'])
        
        current_line = []
        current_block = -1
        
        for i in range(n_boxes):
            if int(data['conf'][i]) > 30:  # Filter low confidence results
                block_num = data['block_num'][i]
                
                if block_num != current_block and current_line:
                    # New block, save current line
                    line_text = ' '.join(current_line)
                    if line_text.strip():
                        lines.append({
                            'text': line_text.strip(),
                            'confidence': data['conf'][i]
                        })
                    current_line = []
                    current_block = block_num
                
                text = data['text'][i].strip()
                if text:
                    current_line.append(text)
        
        # Add last line
        if current_line:
            line_text = ' '.join(current_line)
            if line_text.strip():
                lines.append({
                    'text': line_text.strip(),
                    'confidence': 0
                })
        
        return lines
    
    @staticmethod
    def _calculate_average_confidence(data: Dict) -> float:
        """Calculate average confidence score"""
        confidences = [int(c) for c in data['conf'] if c != '-1']
        if confidences:
            return sum(confidences) / len(confidences)
        return 0.0
    
    @staticmethod
    def parse_grocery_items(ocr_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Parse OCR result into grocery items
        
        Args:
            ocr_result: OCR result dict with text and lines
            
        Returns:
            List of parsed grocery items
        """
        items = []
        
        lines = ocr_result.get('lines', [])
        
        for line in lines:
            line_text = line.get('text', '')
            item = OCRService._parse_line_to_item(line_text)
            
            if item:
                item['confidence'] = line.get('confidence', 0)
                items.append(item)
        
        # If no items parsed from lines, try parsing full text
        if not items:
            text = ocr_result.get('text', '')
            items = OCRService._parse_text_to_items(text)
        
        return items
    
    @staticmethod
    def _parse_line_to_item(line_text: str) -> Dict[str, Any]:
        """
        Parse a single line of text to extract item information
        
        Supported patterns:
        - "Product Name Quantity Price"
        - "Product Name x Quantity @ Price"
        - "Quantity x Product Name @ Price"
        - "Product Name - Quantity - Price"
        """
        patterns = [
            # Pattern: Name Quantity Price (e.g., "Milk 10 3.99")
            r'^(.+?)\s+(\d+)\s+\$?(\d+\.?\d*)$',
            
            # Pattern: Name x Quantity @ Price (e.g., "Milk x 10 @ 3.99")
            r'^(.+?)\s+x\s*(\d+)\s*@\s*\$?(\d+\.?\d*)$',
            
            # Pattern: Quantity x Name @ Price (e.g., "10 x Milk @ 3.99")
            r'^(\d+)\s*x\s*(.+?)\s*@\s*\$?(\d+\.?\d*)$',
            
            # Pattern: Name - Quantity - Price (e.g., "Milk - 10 - 3.99")
            r'^(.+?)\s*-\s*(\d+)\s*-\s*\$?(\d+\.?\d*)$',
            
            # Pattern: Name Qty: Quantity Price: Price
            r'^(.+?)\s+[Qq]ty:?\s*(\d+)\s+[Pp]rice:?\s*\$?(\d+\.?\d*)$',
        ]
        
        for idx, pattern in enumerate(patterns):
            match = re.search(pattern, line_text.strip())
            if match:
                # Pattern 3 has quantity first
                is_qty_first = idx == 2
                
                name = match.group(2).strip() if is_qty_first else match.group(1).strip()
                quantity = int(match.group(1)) if is_qty_first else int(match.group(2))
                price = float(match.group(3))
                
                return {
                    'name': name,
                    'quantity': quantity,
                    'price': price,
                    'category': OCRService._categorize_item(name)
                }
        
        return None
    
    @staticmethod
    def _parse_text_to_items(text: str) -> List[Dict[str, Any]]:
        """Parse full text to extract items"""
        items = []
        lines = text.split('\n')
        
        for line in lines:
            item = OCRService._parse_line_to_item(line)
            if item:
                items.append(item)
        
        return items
    
    @staticmethod
    def _categorize_item(item_name: str) -> str:
        """Categorize item based on name keywords"""
        name_lower = item_name.lower()
        
        # Dairy products
        dairy_keywords = ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg']
        if any(keyword in name_lower for keyword in dairy_keywords):
            return 'Dairy'
        
        # Bakery
        bakery_keywords = ['bread', 'bun', 'cake', 'pastry', 'cookie', 'biscuit']
        if any(keyword in name_lower for keyword in bakery_keywords):
            return 'Bakery'
        
        # Produce
        produce_keywords = ['tomato', 'potato', 'onion', 'carrot', 'lettuce', 'fruit',
                           'apple', 'banana', 'orange', 'vegetable', 'veggie']
        if any(keyword in name_lower for keyword in produce_keywords):
            return 'Produce'
        
        # Meat
        meat_keywords = ['chicken', 'beef', 'pork', 'fish', 'meat', 'sausage', 'bacon']
        if any(keyword in name_lower for keyword in meat_keywords):
            return 'Meat'
        
        # Beverages
        beverage_keywords = ['juice', 'soda', 'water', 'coffee', 'tea', 'drink', 'cola']
        if any(keyword in name_lower for keyword in beverage_keywords):
            return 'Beverages'
        
        # Snacks
        snack_keywords = ['chips', 'snack', 'candy', 'chocolate', 'crisp']
        if any(keyword in name_lower for keyword in snack_keywords):
            return 'Snacks'
        
        # Canned/Packaged
        packaged_keywords = ['can', 'jar', 'box', 'packet', 'pack']
        if any(keyword in name_lower for keyword in packaged_keywords):
            return 'Packaged'
        
        return 'Other'
