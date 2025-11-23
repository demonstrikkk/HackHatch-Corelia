from fastapi import APIRouter, Depends, HTTPException
from app.database import get_database
from app.utils.auth import get_current_user
from app.schemas import ShopMatchRequest
from typing import List, Optional
import math
import csv
import os

router = APIRouter()

# Load Delhi NCR stores data
def load_delhi_stores():
    """Load stores from Delhi NCR CSV file"""
    stores = []
    csv_path = os.path.join(os.path.dirname(__file__), "../../../../delhi_ncr_stores_data.csv")
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            stores_dict = {}
            
            for row in reader:
                store_id = row['Store_ID']
                if store_id not in stores_dict:
                    stores_dict[store_id] = {
                        "id": store_id,
                        "name": row['Store_Name'],
                        "category": row['Store_Type'],
                        "location": row['Location'],
                        "owner": row['Owner_Name'],
                        "contact": row['Contact_Number'],
                        "address": row['Address'],
                        "distance": 0.0,
                        "rating": 4.0 + (hash(store_id) % 10) / 10,
                        "isOpen": True,
                        "inventory": {}
                    }
                
                # Add item to inventory
                item_name = row['Item_Name']
                price = float(row['Price'])
                stores_dict[store_id]["inventory"][item_name] = {
                    "name": item_name,
                    "price": price,
                    "stock": 10 + (hash(item_name) % 50)
                }
            
            stores = list(stores_dict.values())
            print(f"✅ Loaded {len(stores)} stores from Delhi NCR CSV")
    except FileNotFoundError:
        print(f"⚠️ Warning: Delhi NCR stores CSV not found at {csv_path}")
    except Exception as e:
        print(f"❌ Error loading Delhi NCR stores: {e}")
    
    return stores

# Cache stores data
DELHI_STORES = load_delhi_stores()

@router.get("")
async def get_all_shops(category: str = None, location: str = None, db = Depends(get_database)):
    """Get all shops from Delhi NCR stores data"""
    shops = DELHI_STORES.copy()
    
    # Filter by category
    if category:
        shops = [s for s in shops if s["category"].lower() == category.lower()]
    
    # Filter by location (Delhi shows all Delhi NCR stores)
    # For other cities, would filter differently, but for now all data is Delhi NCR
    
    # Return simplified data for listing
    simplified_shops = [{
        "id": s["id"],
        "name": s["name"],
        "category": s["category"],
        "location": s["location"],
        "distance": s["distance"],
        "rating": s["rating"],
        "isOpen": s["isOpen"],
        "itemCount": len(s["inventory"])
    } for s in shops]
    
    return {"shops": simplified_shops, "total": len(simplified_shops)}

@router.get("/{shop_id}")
async def get_shop_by_id(shop_id: str, db = Depends(get_database)):
    """Get shop details by ID from Delhi NCR stores data"""
    # Find shop
    shop_data = next((s for s in DELHI_STORES if s["id"] == shop_id), None)
    
    if not shop_data:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    # Format shop details
    shop = {
        "name": shop_data["name"],
        "category": shop_data["category"],
        "rating": shop_data["rating"],
        "reviews": 50 + (hash(shop_id) % 200),
        "distance": shop_data["distance"],
        "location": shop_data["location"],
        "address": shop_data["address"],
        "phone": shop_data["contact"],
        "owner": shop_data["owner"],
        "hours": "Mon-Sun: 8:00 AM - 10:00 PM",
        "isOpen": shop_data["isOpen"],
    }
    
    # Get inventory from CSV data
    inventory = [{
        "id": idx,
        "name": item_data["name"],
        "price": item_data["price"],
        "stock": item_data["stock"],
        "category": "Grocery"
    } for idx, item_data in enumerate(shop_data["inventory"].values())]
    
    return {"shop": shop, "inventory": inventory}

@router.get("/search")
async def search_shops(q: str, db = Depends(get_database)):
    """Search shops from Delhi NCR stores data"""
    # Filter by query
    filtered = [
        {
            "id": s["id"],
            "name": s["name"],
            "category": s["category"],
            "location": s["location"],
            "distance": s["distance"],
            "rating": s["rating"]
        }
        for s in DELHI_STORES
        if q.lower() in s["name"].lower() or 
           q.lower() in s["category"].lower() or 
           q.lower() in s["location"].lower()
    ]
    
    return {"shops": filtered}

@router.post("/match")
async def match_grocery_list(request: ShopMatchRequest, db = Depends(get_database)):
    """Match grocery list with Delhi NCR stores and find best options"""
    requested_items = [item.lower().strip() for item in request.items]
    matches = []
    
    for store in DELHI_STORES:
        matched_items = []
        missing_items = []
        total_price = 0.0
        
        # Check each requested item
        for req_item in requested_items:
            found = False
            # Check if item exists in store inventory (fuzzy match)
            for inv_item_name, inv_item_data in store["inventory"].items():
                if req_item in inv_item_name.lower() or inv_item_name.lower() in req_item:
                    matched_items.append(inv_item_name)
                    total_price += inv_item_data["price"]
                    found = True
                    break
            
            if not found:
                missing_items.append(req_item)
        
        # Calculate availability percentage
        availability = (len(matched_items) / len(requested_items) * 100) if requested_items else 0
        
        # Only include stores that have at least some items
        if matched_items:
            matches.append({
                "id": store["id"],
                "name": store["name"],
                "location": store["location"],
                "totalPrice": round(total_price, 2),
                "distance": store["distance"],
                "availability": round(availability, 1),
                "rating": store["rating"],
                "matchedItems": matched_items,
                "missingItems": missing_items
            })
    
    # Sort by weighted score: availability (40%), price (30%), rating (20%), distance (10%)
    def calculate_score(match):
        availability_score = match["availability"] * 0.4
        price_score = (100 / (match["totalPrice"] + 1)) * 30
        rating_score = (match["rating"] / 5.0) * 20
        distance_score = (100 / (match["distance"] + 1)) * 10
        return availability_score + price_score + rating_score + distance_score
    
    matches.sort(key=calculate_score, reverse=True)
    
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
