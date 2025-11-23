from fastapi import APIRouter, Depends, HTTPException
from app.database import get_database
from app.utils.auth import get_current_user
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    shop_name: Optional[str] = None
    business_category: Optional[str] = None
    business_address: Optional[str] = None

@router.get("/profile")
async def get_profile(current_user: str = Depends(get_current_user), db = Depends(get_database)):
    user = await db.users.find_one({"email": current_user})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["id"] = str(user["_id"])
    del user["_id"]
    del user["password"]
    
    return {"user": user}

@router.put("/profile")
async def update_profile(profile_data: ProfileUpdate, current_user: str = Depends(get_current_user), db = Depends(get_database)):
    # Build update dict with only provided fields
    update_data = {}
    if profile_data.name is not None:
        update_data["name"] = profile_data.name
    if profile_data.phone is not None:
        update_data["phone"] = profile_data.phone
    if profile_data.address is not None:
        update_data["address"] = profile_data.address
    if profile_data.shop_name is not None:
        update_data["shop_name"] = profile_data.shop_name
    if profile_data.business_category is not None:
        update_data["business_category"] = profile_data.business_category
    if profile_data.business_address is not None:
        update_data["business_address"] = profile_data.business_address
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.users.update_one(
        {"email": current_user},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or no changes made")
    
    # Return updated user
    user = await db.users.find_one({"email": current_user})
    user["id"] = str(user["_id"])
    del user["_id"]
    del user["password"]
    
    return {"message": "Profile updated successfully", "user": user}

@router.get("/expiring-items")
async def get_expiring_items(current_user: str = Depends(get_current_user), db = Depends(get_database)):
    # Mock expiring items - in production, fetch from user's purchase history
    expiring_items = [
        {
            "name": "Milk",
            "shop": "Fresh Mart",
            "expiryDate": "2024-01-20",
            "daysLeft": 3
        },
        {
            "name": "Bread",
            "shop": "Local Bakery",
            "expiryDate": "2024-01-22",
            "daysLeft": 5
        }
    ]
    
    return {"items": expiring_items}

@router.get("/loyalty")
async def get_loyalty(current_user: str = Depends(get_current_user), db = Depends(get_database)):
    user = await db.users.find_one({"email": current_user})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    points = user.get("loyalty_points", 0)
    
    # Mock rewards
    rewards = [
        {"id": 1, "name": "$5 Discount", "points": 500, "description": "Get $5 off", "icon": "💵"},
        {"id": 2, "name": "Free Delivery", "points": 300, "description": "Free delivery", "icon": "🚚"},
    ]
    
    return {
        "points": points,
        "rewards": rewards,
        "tier": "gold" if points > 1000 else "silver" if points > 500 else "bronze"
    }

@router.get("/reviews")
async def get_reviews(current_user: str = Depends(get_current_user), db = Depends(get_database)):
    # Fetch user's reviews
    reviews = await db.reviews.find({"user_email": current_user}).to_list(length=100)
    
    for review in reviews:
        review["id"] = str(review["_id"])
        del review["_id"]
    
    return {"reviews": reviews}

@router.post("/reviews")
async def add_review(review_data: dict, current_user: str = Depends(get_current_user), db = Depends(get_database)):
    review_data["user_email"] = current_user
    review_data["created_at"] = datetime.utcnow()
    review_data["verified"] = True
    
    result = await db.reviews.insert_one(review_data)
    
    # Add loyalty points
    await db.users.update_one(
        {"email": current_user},
        {"$inc": {"loyalty_points": 50}}
    )
    
    return {"success": True, "review_id": str(result.inserted_id)}

@router.post("/bills")
async def create_bill(bill_data: dict, current_user: str = Depends(get_current_user), db = Depends(get_database)):
    """Generate a bill after purchase"""
    # Generate unique bill ID
    from random import randint
    bill_id = f"BILL-{datetime.utcnow().strftime('%Y%m%d')}-{randint(1000, 9999)}"
    
    # Structure bill document
    bill_document = {
        "bill_id": bill_id,
        "user_email": current_user,
        "items": bill_data.get("items", []),
        "total_amount": bill_data.get("total_amount", 0),
        "shop_name": bill_data.get("shop_name", "Multiple Shops"),
        "shop_id": bill_data.get("shop_id"),  # Track shop_id
        "purchase_date": datetime.utcnow(),
        "status": "paid"
    }
    
    # Save bill to database
    result = await db.bills.insert_one(bill_document)
    
    # Add loyalty points based on purchase amount
    points_earned = int(bill_document["total_amount"] / 10)  # 1 point per $10
    await db.users.update_one(
        {"email": current_user},
        {"$inc": {"loyalty_points": points_earned}}
    )
    
    # Update seller's sales statistics if shop_id provided
    shop_id = bill_data.get("shop_id")
    if shop_id:
        items = bill_data.get("items", [])
        total_items_sold = sum(item.get("quantity", 1) for item in items)
        
        # Update seller's total_sales and total_revenue
        await db.users.update_one(
            {"shop_id": shop_id, "role": "seller"},
            {
                "$inc": {
                    "total_sales": total_items_sold,
                    "total_revenue": bill_data.get("total_amount", 0)
                }
            }
        )
    
    return {
        "success": True,
        "bill_id": bill_id,
        "points_earned": points_earned
    }

@router.get("/bills")
async def get_bills(current_user: str = Depends(get_current_user), db = Depends(get_database)):
    """Get all bills for the current user"""
    bills = await db.bills.find({"user_email": current_user}).sort("purchase_date", -1).to_list(length=100)
    
    for bill in bills:
        bill["id"] = str(bill["_id"])
        del bill["_id"]
    
    return {"bills": bills}
