import os
import json
from typing import List, Dict, Any
import logging
import httpx

logger = logging.getLogger(__name__)

class LLMService:
    """
    LLM Service for parsing OCR text into structured grocery items
    Uses OpenRouter API with various models
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('OPENROUTER_API_KEY')
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "meta-llama/llama-3.1-8b-instruct:free"  # Free model
        
    async def parse_ocr_text_to_items(self, ocr_text: str) -> List[Dict[str, Any]]:
        """
        Parse OCR text into structured grocery items using LLM
        
        Args:
            ocr_text: Raw OCR extracted text from bill/invoice
            
        Returns:
            List of structured grocery items
        """
        logger.info(f"Starting LLM parsing with {len(ocr_text)} characters of text")
        
        try:
            if not self.api_key:
                logger.error("No API key provided for LLM service")
                return []
            
            prompt = self._create_parsing_prompt(ocr_text)
            logger.info("Created parsing prompt")
            
            response = await self._call_openrouter(prompt)
            logger.info(f"Got LLM response: {response[:200]}...")
            
            # Parse the LLM response
            items = self._parse_llm_response(response)
            logger.info(f"Parsed {len(items)} items from LLM response")
            
            return items
            
        except Exception as e:
            logger.error(f"LLM Parsing Error: {str(e)}", exc_info=True)
            return []
    
    def _create_parsing_prompt(self, ocr_text: str) -> str:
        """Create a prompt for the LLM to parse OCR text"""
        return f"""You are a grocery bill parser. Parse the following OCR-extracted text from a grocery bill/invoice and extract all items with their details.

OCR Text:
{ocr_text}

Extract each item and return them in the following JSON format ONLY (no additional text):
[
  {{
    "name": "product name",
    "quantity": number,
    "price": number,
    "category": "category name"
  }}
]

Categories should be one of: Dairy, Bakery, Produce, Meat, Beverages, Snacks, Packaged, Other

Rules:
1. Extract ONLY actual product items (ignore headers, footers, totals, store info)
2. If quantity is not mentioned, use 1
3. Price should be the unit price or total price per item
4. Categorize items appropriately
5. Return ONLY the JSON array, no other text

JSON Array:"""
    
    async def _call_openrouter(self, prompt: str) -> str:
        """Call OpenRouter API"""
        logger.info("Calling OpenRouter API...")
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://corelia-app.com",
                "X-Title": "Corelia Grocery App"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3,
                "max_tokens": 2000
            }
            
            logger.info(f"Using model: {self.model}")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                
                logger.info(f"OpenRouter response status: {response.status_code}")
                
                if response.status_code != 200:
                    logger.error(f"OpenRouter API Error: {response.status_code} - {response.text}")
                    return "[]"
                
                result = response.json()
                content = result.get('choices', [{}])[0].get('message', {}).get('content', '[]')
                
                logger.info(f"LLM response content length: {len(content)}")
                
                return content.strip()
                
        except Exception as e:
            logger.error(f"OpenRouter API Call Error: {str(e)}", exc_info=True)
            return "[]"
    
    def _parse_llm_response(self, response: str) -> List[Dict[str, Any]]:
        """Parse LLM response into structured items"""
        try:
            # Try to find JSON in the response
            response = response.strip()
            
            # Remove markdown code blocks if present
            if response.startswith('```'):
                lines = response.split('\n')
                response = '\n'.join(lines[1:-1]) if len(lines) > 2 else response
                response = response.replace('```json', '').replace('```', '').strip()
            
            # Try to parse as JSON
            items = json.loads(response)
            
            # Validate and clean items
            cleaned_items = []
            for item in items:
                if isinstance(item, dict) and 'name' in item:
                    cleaned_item = {
                        'name': str(item.get('name', 'Unknown')),
                        'quantity': int(item.get('quantity', 1)),
                        'price': float(item.get('price', 0.0)),
                        'category': str(item.get('category', 'Other'))
                    }
                    cleaned_items.append(cleaned_item)
            
            return cleaned_items
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {str(e)}")
            logger.error(f"Response: {response}")
            
            # Try to extract JSON from text
            try:
                # Find JSON array in text
                start_idx = response.find('[')
                end_idx = response.rfind(']') + 1
                
                if start_idx != -1 and end_idx > start_idx:
                    json_str = response[start_idx:end_idx]
                    items = json.loads(json_str)
                    return items
            except:
                pass
            
            return []
        except Exception as e:
            logger.error(f"Error parsing LLM response: {str(e)}")
            return []
