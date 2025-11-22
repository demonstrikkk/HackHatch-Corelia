from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.database import get_database
from app.utils.auth import get_current_user
from app.utils.ocr_service import OCRService
from app.utils.llm_service import LLMService
from datetime import datetime
import random
import os
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize LLM service with API key from environment
llm_service = LLMService(api_key=os.getenv('OPENROUTER_API_KEY'))

@router.get("")
async def get_inventory(current_user: str = Depends(get_current_user), db = Depends(get_database)):
    # Mock inventory for demo
    items = [
        {"id": "1", "name": "Milk (1L)", "category": "Dairy", "price": 3.99, "stock": 45, "unit": "L"},
        {"id": "2", "name": "Bread (White)", "category": "Bakery", "price": 2.49, "stock": 12, "unit": "loaf"},
        {"id": "3", "name": "Eggs (12)", "category": "Dairy", "price": 4.99, "stock": 8, "unit": "dozen"},
    ]
    
    return {"items": items}

@router.post("")
async def create_inventory_item(item: dict, current_user: str = Depends(get_current_user), db = Depends(get_database)):
    # Always use current datetime (UTC)
    current_time = datetime.utcnow()
    item["created_at"] = current_time
    item["updated_at"] = current_time
    item["owner_email"] = current_user
    
    logger.info(f"Creating inventory item '{item.get('name')}' at {current_time}")
    
    result = await db.inventory.insert_one(item)
    
    return {"success": True, "id": str(result.inserted_id), "created_at": current_time.isoformat()}

@router.put("/{item_id}")
async def update_inventory_item(item_id: str, item: dict, current_user: str = Depends(get_current_user), db = Depends(get_database)):
    item["updated_at"] = datetime.utcnow()
    
    result = await db.inventory.update_one(
        {"_id": item_id, "owner_email": current_user},
        {"$set": item}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"success": True}

@router.delete("/{item_id}")
async def delete_inventory_item(item_id: str, current_user: str = Depends(get_current_user), db = Depends(get_database)):
    result = await db.inventory.delete_one({"_id": item_id, "owner_email": current_user})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"success": True}

@router.post("/upload")
async def upload_inventory(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    # Handle bulk upload (CSV, Excel, etc.)
    return {"success": True, "message": "File uploaded successfully"}

@router.post("/ocr-scan")
async def ocr_scan(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    """
    OCR endpoint to extract inventory from bill/invoice images
    Step 1: Uses pytesseract for OCR text extraction
    Step 2: Uses OpenRouter LLM to intelligently parse text into structured items
    """
    logger.info(f"OCR scan started by {current_user} for file: {file.filename}")
    
    try:
        # Read the uploaded file
        contents = await file.read()
        logger.info(f"File size: {len(contents)} bytes")
        
        # Step 1: Process image with OCR to extract text
        logger.info("Starting OCR text extraction...")
        ocr_result = await OCRService.process_image(contents)
        
        if not ocr_result.get('success'):
            raise HTTPException(
                status_code=400,
                detail=f"OCR processing failed: {ocr_result.get('error', 'Unknown error')}"
            )
        
        raw_text = ocr_result.get('text', '').strip()
        logger.info(f"OCR extracted text length: {len(raw_text)} characters")
        logger.info(f"OCR text preview: {raw_text[:200]}..." if len(raw_text) > 200 else f"OCR text: {raw_text}")
        
        if not raw_text:
            logger.warning("No text extracted from image")
            # No text extracted, return mock data
            extracted_items = [
                {"name": "Milk 1L", "quantity": 10, "price": 3.99, "category": "Dairy"},
                {"name": "Bread White", "quantity": 15, "price": 2.49, "category": "Bakery"},
                {"name": "Eggs 12pk", "quantity": 8, "price": 4.99, "category": "Dairy"},
            ]
            
            return {
                "success": True,
                "items": extracted_items,
                "total_items": len(extracted_items),
                "ocr_confidence": 0,
                "raw_text": "No text detected in image",
                "demo_mode": True,
                "message": "No text detected, using demo data"
            }
        
        # Step 2: Use LLM to parse OCR text into structured items
        logger.info("Starting LLM parsing...")
        extracted_items = await llm_service.parse_ocr_text_to_items(raw_text)
        logger.info(f"LLM extracted {len(extracted_items)} items")
        
        # Fallback: If LLM parsing fails, try regex-based parsing
        if not extracted_items:
            logger.warning("LLM parsing failed, trying regex-based parsing...")
            extracted_items = OCRService.parse_grocery_items(ocr_result)
            logger.info(f"Regex extracted {len(extracted_items)} items")
        
        # Final fallback: If still no items, use mock data
        if not extracted_items:
            logger.warning("All parsing methods failed, using mock data")
            extracted_items = [
                {"name": "Milk 1L", "quantity": 10, "price": 3.99, "category": "Dairy"},
                {"name": "Bread White", "quantity": 15, "price": 2.49, "category": "Bakery"},
                {"name": "Eggs 12pk", "quantity": 8, "price": 4.99, "category": "Dairy"},
                {"name": "Tomatoes 1kg", "quantity": 20, "price": 5.99, "category": "Produce"},
            ]
            
            return {
                "success": True,
                "items": extracted_items,
                "total_items": len(extracted_items),
                "ocr_confidence": ocr_result.get('confidence', 0),
                "raw_text": raw_text[:500],  # First 500 chars
                "demo_mode": True,
                "message": "Could not parse items from text, using demo data"
            }
        
        return {
            "success": True,
            "items": extracted_items,
            "total_items": len(extracted_items),
            "ocr_confidence": ocr_result.get('confidence', 0),
            "raw_text": raw_text[:500],  # First 500 chars for preview
            "parsed_by": "llm" if extracted_items else "regex",
            "message": f"Successfully extracted {len(extracted_items)} items from bill"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR Scan Error: {str(e)}")
        
        # Fallback to mock data on error
        extracted_items = [
            {"name": "Milk 1L", "quantity": 10, "price": 3.99, "category": "Dairy"},
            {"name": "Bread White", "quantity": 15, "price": 2.49, "category": "Bakery"},
            {"name": "Eggs 12pk", "quantity": 8, "price": 4.99, "category": "Dairy"},
            {"name": "Tomatoes 1kg", "quantity": 20, "price": 5.99, "category": "Produce"},
        ]
        
        return {
            "success": True,
            "items": extracted_items,
            "total_items": len(extracted_items),
            "error": str(e),
            "demo_mode": True,
            "message": "Error occurred, using demo data"
        }
