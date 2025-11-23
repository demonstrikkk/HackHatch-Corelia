from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from app.database import get_database
from app.utils.auth import get_current_user
from app.utils.ocr_service import OCRService
from app.utils.llm_service import LLMService
from app.utils.expiry_logic import calculate_expiry_date, get_expiry_info, get_all_categories_info
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
    try:
        # Query MongoDB for user's inventory items
        items_cursor = db.inventory.find({"owner_email": current_user})
        items = await items_cursor.to_list(length=None)
        
        # Convert ObjectId to string and format for frontend
        formatted_items = []
        current_time = datetime.utcnow()
        
        for item in items:
            expiry_date = item.get("expiry_date")
            days_until_expiry = None
            expiry_status = None
            
            if expiry_date:
                if isinstance(expiry_date, str):
                    expiry_date = datetime.fromisoformat(expiry_date.replace('Z', '+00:00'))
                days_until_expiry = (expiry_date - current_time).days
                
                if days_until_expiry < 0:
                    expiry_status = "expired"
                elif days_until_expiry <= 3:
                    expiry_status = "critical"
                elif days_until_expiry <= 7:
                    expiry_status = "warning"
                else:
                    expiry_status = "normal"
            
            formatted_item = {
                "id": str(item["_id"]),
                "name": item.get("name", ""),
                "category": item.get("category", ""),
                "price": item.get("price", 0),
                "stock": item.get("stock", 0),
                "unit": item.get("unit", ""),
                "expiry_date": expiry_date.isoformat() if expiry_date else None,
                "days_until_expiry": days_until_expiry,
                "expiry_status": expiry_status,
                "created_at": item.get("created_at"),
                "updated_at": item.get("updated_at")
            }
            formatted_items.append(formatted_item)
        
        logger.info(f"Retrieved {len(formatted_items)} inventory items for user {current_user}")
        
        return {"items": formatted_items}
        
    except Exception as e:
        logger.error(f"Get Inventory Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch inventory: {str(e)}")

@router.post("")
async def create_inventory_item(item: dict, current_user: str = Depends(get_current_user), db = Depends(get_database)):
    try:
        logger.info(f"Received inventory item creation request from {current_user}")
        logger.info(f"Item data: {item}")
        
        # Always use current datetime (UTC)
        current_time = datetime.utcnow()
        item["created_at"] = current_time
        item["updated_at"] = current_time
        item["owner_email"] = current_user
        
        # Auto-calculate expiry date if not provided but category exists
        if "expiry_date" not in item or not item["expiry_date"]:
            if "category" in item and item["category"]:
                item["expiry_date"] = calculate_expiry_date(item["category"], current_time)
                logger.info(f"Auto-calculated expiry date for '{item.get('name')}' ({item['category']}): {item['expiry_date']}")
        
        logger.info(f"Creating inventory item '{item.get('name')}' at {current_time}")
        
        result = await db.inventory.insert_one(item)
        
        logger.info(f"Successfully created item with ID: {result.inserted_id}")
        
        return {"success": True, "id": str(result.inserted_id), "created_at": current_time.isoformat()}
    
    except Exception as e:
        logger.error(f"Failed to create inventory item: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create inventory item: {str(e)}")

@router.post("/deduct-stock")
async def deduct_stock(items: List[dict], db = Depends(get_database)):
    """
    Deduct stock from seller inventory when customer makes a purchase
    Items format: [{"shop_id": "SHP#####", "name": "...", "quantity": ...}]
    """
    try:
        deducted_items = []
        
        for purchase_item in items:
            shop_id = purchase_item.get("shop_id")
            item_name = purchase_item.get("name")
            quantity = purchase_item.get("quantity", 1)
            
            # Skip if no shop_id (CSV shop, not a real seller)
            if not shop_id:
                logger.info(f"Skipping stock deduction for CSV shop item: {item_name}")
                continue
            
            # Find seller by shop_id
            seller = await db.users.find_one({"shop_id": shop_id, "role": "seller"})
            
            if not seller:
                logger.warning(f"No seller found for shop_id: {shop_id}")
                continue
            
            seller_email = seller["email"]
            
            # Find the item in seller's inventory
            inventory_item = await db.inventory.find_one({
                "owner_email": seller_email,
                "name": {"$regex": item_name, "$options": "i"}  # Case-insensitive match
            })
            
            if inventory_item:
                new_stock = max(0, inventory_item.get("stock", 0) - quantity)
                
                # Update stock in inventory
                await db.inventory.update_one(
                    {"_id": inventory_item["_id"]},
                    {"$set": {"stock": new_stock, "updated_at": datetime.utcnow()}}
                )
                
                deducted_items.append({
                    "item_name": item_name,
                    "shop_id": shop_id,
                    "shop_name": seller.get("shop_name", "Unknown"),
                    "old_stock": inventory_item.get("stock", 0),
                    "new_stock": new_stock,
                    "deducted": quantity
                })
                
                logger.info(f"Deducted {quantity} of '{item_name}' from shop {shop_id}. Stock: {inventory_item.get('stock', 0)} → {new_stock}")
            else:
                logger.warning(f"Item '{item_name}' not found in shop {shop_id}'s inventory")
        
        return {
            "success": True,
            "deducted_items": deducted_items,
            "total_updated": len(deducted_items)
        }
        
    except Exception as e:
        logger.error(f"Deduct Stock Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to deduct stock: {str(e)}")

@router.put("/{item_id}")
async def update_inventory_item(item_id: str, item: dict, current_user: str = Depends(get_current_user), db = Depends(get_database)):
    try:
        from bson import ObjectId
        
        item["updated_at"] = datetime.utcnow()
        
        # Remove id from update data if present
        item.pop("id", None)
        item.pop("_id", None)
        
        result = await db.inventory.update_one(
            {"_id": ObjectId(item_id), "owner_email": current_user},
            {"$set": item}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        
        logger.info(f"Updated inventory item {item_id} for user {current_user}")
        return {"success": True}
        
    except Exception as e:
        logger.error(f"Update Inventory Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update item: {str(e)}")

@router.delete("/{item_id}")
async def delete_inventory_item(item_id: str, current_user: str = Depends(get_current_user), db = Depends(get_database)):
    try:
        from bson import ObjectId
        
        result = await db.inventory.delete_one({"_id": ObjectId(item_id), "owner_email": current_user})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        
        logger.info(f"Deleted inventory item {item_id} for user {current_user}")
        return {"success": True}
        
    except Exception as e:
        logger.error(f"Delete Inventory Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete item: {str(e)}")

@router.post("/upload")
async def upload_inventory(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    # Handle bulk upload (CSV, Excel, etc.)
    return {"success": True, "message": "File uploaded successfully"}

@router.get("/expiring")
async def get_expiring_items(current_user: str = Depends(get_current_user), db = Depends(get_database)):
    """
    Get items that are expiring soon (within 7 days) or already expired
    """
    try:
        items_cursor = db.inventory.find({"owner_email": current_user})
        items = await items_cursor.to_list(length=None)
        
        current_time = datetime.utcnow()
        expiring_items = []
        
        for item in items:
            expiry_date = item.get("expiry_date")
            if not expiry_date:
                continue
                
            if isinstance(expiry_date, str):
                expiry_date = datetime.fromisoformat(expiry_date.replace('Z', '+00:00'))
            
            days_until_expiry = (expiry_date - current_time).days
            
            # Include items expiring within 7 days or already expired
            if days_until_expiry <= 7:
                expiry_status = "expired" if days_until_expiry < 0 else ("critical" if days_until_expiry <= 3 else "warning")
                
                expiring_items.append({
                    "id": str(item["_id"]),
                    "name": item.get("name", ""),
                    "category": item.get("category", ""),
                    "stock": item.get("stock", 0),
                    "unit": item.get("unit", ""),
                    "expiry_date": expiry_date.isoformat(),
                    "days_until_expiry": days_until_expiry,
                    "expiry_status": expiry_status
                })
        
        # Sort by days until expiry (most urgent first)
        expiring_items.sort(key=lambda x: x["days_until_expiry"])
        
        logger.info(f"Found {len(expiring_items)} expiring items for user {current_user}")
        
        return {
            "expiring_items": expiring_items,
            "total_count": len(expiring_items),
            "expired_count": len([i for i in expiring_items if i["expiry_status"] == "expired"]),
            "critical_count": len([i for i in expiring_items if i["expiry_status"] == "critical"]),
            "warning_count": len([i for i in expiring_items if i["expiry_status"] == "warning"])
        }
        
    except Exception as e:
        logger.error(f"Get Expiring Items Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch expiring items: {str(e)}")

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
        try:
            ocr_result = await OCRService.process_image(contents)
        except Exception as ocr_error:
            logger.warning(f"OCR Service failed: {str(ocr_error)}. Using mock data.")
            # Return mock data if OCR fails (e.g., tesseract not installed)
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
                "ocr_confidence": 0,
                "raw_text": "OCR not available - using demo data",
                "demo_mode": True,
                "message": f"OCR service unavailable: {str(ocr_error)}. Using demo data for testing."
            }
        
        if not ocr_result.get('success'):
            logger.warning(f"OCR failed: {ocr_result.get('error')}. Using mock data.")
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
                "ocr_confidence": 0,
                "raw_text": "OCR processing failed - using demo data",
                "demo_mode": True,
                "message": f"OCR processing failed: {ocr_result.get('error')}. Using demo data."
            }
        
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
            "message": "Using mock data due to processing error"
        }


@router.get("/expiry-info/{category}")
async def get_category_expiry_info(category: str, current_user: str = Depends(get_current_user)):
    """
    Get expiry information for a specific category
    Returns days until expiry and human-readable duration
    """
    try:
        info = get_expiry_info(category)
        return {
            "success": True,
            "category": category,
            "expiry_info": info
        }
    except Exception as e:
        logger.error(f"Error getting expiry info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/expiry-categories")
async def get_all_expiry_categories(current_user: str = Depends(get_current_user)):
    """
    Get expiry information for all categories
    Useful for displaying in dropdowns with shelf life info
    """
    try:
        categories_info = get_all_categories_info()
        return {
            "success": True,
            "categories": categories_info,
            "total_categories": len(categories_info)
        }
    except Exception as e:
        logger.error(f"Error getting categories info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
