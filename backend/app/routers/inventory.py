from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.database import get_database
from app.utils.auth import get_current_user
from datetime import datetime
import random

router = APIRouter()

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
    item["created_at"] = datetime.utcnow()
    item["updated_at"] = datetime.utcnow()
    item["owner_email"] = current_user
    
    result = await db.inventory.insert_one(item)
    
    return {"success": True, "id": str(result.inserted_id)}

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
    In production: use pytesseract or cloud OCR services
    """
    
    # Mock OCR extraction
    extracted_items = [
        {"name": "Milk 1L", "quantity": 10, "price": 3.99, "category": "Dairy"},
        {"name": "Bread White", "quantity": 15, "price": 2.49, "category": "Bakery"},
        {"name": "Eggs 12pk", "quantity": 8, "price": 4.99, "category": "Dairy"},
        {"name": "Tomatoes 1kg", "quantity": 20, "price": 5.99, "category": "Produce"},
        {"name": "Chicken Breast 1kg", "quantity": 12, "price": 12.99, "category": "Meat"},
    ]
    
    return {
        "success": True,
        "items": extracted_items,
        "total_items": len(extracted_items)
    }
