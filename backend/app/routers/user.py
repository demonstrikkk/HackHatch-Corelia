from fastapi import APIRouter, Depends, HTTPException
from app.database import get_database
from app.utils.auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/profile")
async def get_profile(current_user: str = Depends(get_current_user), db = Depends(get_database)):
    user = await db.users.find_one({"email": current_user})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["id"] = str(user["_id"])
    del user["_id"]
    del user["password"]
    
    return {"user": user}

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
