from fastapi import APIRouter, Depends, HTTPException
from app.database import get_database
from app.utils.auth import get_current_user
from app.schemas import ShopMatchRequest
from typing import List
import math

router = APIRouter()

@router.get("")
async def get_all_shops(category: str = None, db = Depends(get_database)):
    # Mock shops data
    shops = [
        {"id": "1", "name": "Fresh Mart", "category": "Grocery", "distance": 0.8, "rating": 4.5, "isOpen": True, "image": "shop1"},
        {"id": "2", "name": "Green Valley", "category": "Organic", "distance": 1.2, "rating": 4.7, "isOpen": True, "image": "shop2"},
        {"id": "3", "name": "Quick Stop", "category": "Convenience", "distance": 0.5, "rating": 4.2, "isOpen": False, "image": "shop3"},
        {"id": "4", "name": "Super Saver", "category": "Grocery", "distance": 2.1, "rating": 4.6, "isOpen": True, "image": "shop4"},
    ]
    
    if category:
        shops = [s for s in shops if s["category"].lower() == category.lower()]
    
    return {"shops": shops}

@router.get("/{shop_id}")
async def get_shop_by_id(shop_id: str, db = Depends(get_database)):
    # Mock shop detail
    shop = {
        "name": "Fresh Mart",
        "category": "Grocery Store",
        "rating": 4.5,
        "reviews": 234,
        "distance": 0.8,
        "address": "123 Main Street, City",
        "phone": "+1 (555) 123-4567",
        "hours": "Mon-Sun: 8:00 AM - 10:00 PM",
        "isOpen": True,
    }
    
    # Mock inventory
    inventory = [
        {"id": 1, "name": "Milk (1L)", "price": 3.99, "stock": 45, "category": "Dairy"},
        {"id": 2, "name": "Bread (White)", "price": 2.49, "stock": 12, "category": "Bakery"},
        {"id": 3, "name": "Eggs (12)", "price": 4.99, "stock": 8, "category": "Dairy"},
        {"id": 4, "name": "Tomatoes (1kg)", "price": 5.99, "stock": 23, "category": "Produce"},
    ]
    
    return {"shop": shop, "inventory": inventory}

@router.get("/search")
async def search_shops(q: str, db = Depends(get_database)):
    # Mock search results
    shops = [
        {"id": "1", "name": "Fresh Mart", "category": "Grocery", "distance": 0.8, "rating": 4.5},
        {"id": "2", "name": "Green Valley", "category": "Organic", "distance": 1.2, "rating": 4.7},
    ]
    
    # Filter by query
    filtered = [s for s in shops if q.lower() in s["name"].lower() or q.lower() in s["category"].lower()]
    
    return {"shops": filtered}

@router.post("/match")
async def match_grocery_list(request: ShopMatchRequest, db = Depends(get_database)):
    # Mock matching algorithm
    # In production: calculate based on actual inventory, prices, distance
    matches = [
        {
            "id": "1",
            "name": "Fresh Mart",
            "totalPrice": 45.99,
            "distance": 0.8,
            "availability": 95,
            "rating": 4.5,
            "matchedItems": len(request.items),
            "missingItems": []
        },
        {
            "id": "2",
            "name": "Green Valley",
            "totalPrice": 52.50,
            "distance": 1.2,
            "availability": 88,
            "rating": 4.7,
            "matchedItems": len(request.items) - 1,
            "missingItems": ["Rice"]
        },
        {
            "id": "3",
            "name": "Quick Stop",
            "totalPrice": 48.75,
            "distance": 0.5,
            "availability": 75,
            "rating": 4.2,
            "matchedItems": len(request.items) - 2,
            "missingItems": ["Rice", "Chicken"]
        }
    ]
    
    # Sort by best match (availability + low price + low distance)
    def match_score(shop):
        return (shop["availability"] * 0.4) + ((100 - shop["distance"] * 10) * 0.3) + ((shop["rating"] / 5 * 100) * 0.3)
    
    matches.sort(key=match_score, reverse=True)
    
    return {"matches": matches, "totalShops": len(matches)}
