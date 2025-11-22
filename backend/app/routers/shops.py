from fastapi import APIRouter, Depends, HTTPException
from app.database import get_database
from app.utils.auth import get_current_user
from app.schemas import ShopMatchRequest
from typing import List, Optional
import math

router = APIRouter()

@router.get("")
async def get_all_shops(
    category: Optional[str] = None,
    location: Optional[str] = None,
    limit: int = 50,
    db = Depends(get_database)
):
    """Get all shops with optional filters"""
    query = {}
    
    if category:
        query["store_type"] = {"$regex": category, "$options": "i"}
    
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    shops_cursor = db.shops.find(query).limit(limit)
    shops = []
    
    async for shop in shops_cursor:
        shops.append({
            "id": shop["store_id"],
            "name": shop["name"],
            "category": shop["store_type"],
            "location": shop["location"],
            "address": shop["address"],
            "rating": shop.get("rating", 4.0),
            "isOpen": shop.get("is_open", True),
            "phone": shop.get("contact_number", ""),
            "owner": shop.get("owner_name", "")
        })
    
    return {"shops": shops, "total": len(shops)}

@router.get("/{shop_id}")
async def get_shop_by_id(shop_id: str, db = Depends(get_database)):
    """Get shop details and its inventory"""
    # Get shop details
    shop_data = await db.shops.find_one({"store_id": shop_id})
    
    if not shop_data:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    shop = {
        "id": shop_data["store_id"],
        "name": shop_data["name"],
        "category": shop_data["store_type"],
        "rating": shop_data.get("rating", 4.0),
        "reviews": 0,  # Can be calculated from reviews collection
        "location": shop_data["location"],
        "address": shop_data["address"],
        "phone": shop_data.get("contact_number", ""),
        "owner": shop_data.get("owner_name", ""),
        "hours": "Mon-Sun: 8:00 AM - 10:00 PM",  # Default hours
        "isOpen": shop_data.get("is_open", True),
    }
    
    # Get inventory for this shop
    inventory_cursor = db.inventory_items.find({"store_id": shop_id})
    inventory = []
    
    async for item in inventory_cursor:
        inventory.append({
            "id": item["item_id"],
            "name": item["item_name"],
            "price": item["price"],
            "stock": item["stock_quantity"],
            "category": item["category"]
        })
    
    return {"shop": shop, "inventory": inventory}

@router.get("/search/query")
async def search_shops(q: str, limit: int = 20, db = Depends(get_database)):
    """Search shops by name, type, or location"""
    query = {
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"store_type": {"$regex": q, "$options": "i"}},
            {"location": {"$regex": q, "$options": "i"}},
            {"address": {"$regex": q, "$options": "i"}}
        ]
    }
    
    shops_cursor = db.shops.find(query).limit(limit)
    shops = []
    
    async for shop in shops_cursor:
        shops.append({
            "id": shop["store_id"],
            "name": shop["name"],
            "category": shop["store_type"],
            "location": shop["location"],
            "address": shop["address"],
            "rating": shop.get("rating", 4.0),
            "isOpen": shop.get("is_open", True)
        })
    
    return {"shops": shops, "total": len(shops)}

@router.post("/match")
async def match_grocery_list(request: ShopMatchRequest, db = Depends(get_database)):
    """Match user's grocery list with shops that have the items"""
    if not request.items:
        return {"matches": [], "totalShops": 0}
    
    # Get all shops
    shops_cursor = db.shops.find()
    matches = []
    
    async for shop in shops_cursor:
        shop_id = shop["store_id"]
        
        # Get inventory for this shop
        inventory_cursor = db.inventory_items.find({"store_id": shop_id})
        inventory = []
        async for item in inventory_cursor:
            inventory.append(item)
        
        if not inventory:
            continue
        
        # Match items
        matched_items = []
        total_price = 0
        missing_items = []
        
        for user_item in request.items:
            found = False
            # Try to find matching item in inventory
            for inv_item in inventory:
                if user_item.lower() in inv_item["item_name"].lower():
                    matched_items.append(inv_item["item_name"])
                    total_price += inv_item["price"]
                    found = True
                    break
            
            if not found:
                missing_items.append(user_item)
        
        # Calculate availability percentage
        availability = (len(matched_items) / len(request.items)) * 100 if request.items else 0
        
        # Only include shops with at least some matches
        if len(matched_items) > 0:
            matches.append({
                "id": shop_id,
                "name": shop["name"],
                "totalPrice": round(total_price, 2),
                "distance": 0,  # Would calculate based on user_location
                "availability": round(availability, 1),
                "rating": shop.get("rating", 4.0),
                "matchedItems": len(matched_items),
                "missingItems": missing_items,
                "location": shop["location"]
            })
    
    # Sort by best match (availability first, then price, then rating)
    def match_score(shop):
        return (shop["availability"] * 0.5) + ((shop["rating"] / 5 * 100) * 0.3) + ((100 / (shop["totalPrice"] + 1)) * 0.2)
    
    matches.sort(key=match_score, reverse=True)
    
    # Limit to top 10 matches
    matches = matches[:10]
    
    return {"matches": matches, "totalShops": len(matches)}

@router.get("/filters/locations")
async def get_locations(db = Depends(get_database)):
    """Get all unique locations for filtering"""
    locations = await db.shops.distinct("location")
    return {"locations": sorted(locations)}

@router.get("/filters/categories")
async def get_categories(db = Depends(get_database)):
    """Get all unique store types/categories for filtering"""
    categories = await db.shops.distinct("store_type")
    return {"categories": sorted(categories)}

@router.get("/stats/overview")
async def get_stats(db = Depends(get_database)):
    """Get overall statistics"""
    total_shops = await db.shops.count_documents({})
    total_items = await db.inventory_items.count_documents({})
    locations = await db.shops.distinct("location")
    categories = await db.shops.distinct("store_type")
    
    return {
        "total_shops": total_shops,
        "total_items": total_items,
        "total_locations": len(locations),
        "total_categories": len(categories)
    }
