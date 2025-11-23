from fastapi import APIRouter, Depends
from app.database import get_database
from app.utils.auth import get_current_user
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/seller-stats")
async def get_seller_stats(current_user: str = Depends(get_current_user), db = Depends(get_database)):
    """Get real-time seller statistics"""
    # Get seller info
    seller = await db.users.find_one({"email": current_user, "role": "seller"})
    
    if not seller:
        return {"error": "Not a seller account"}
    
    # Get bills for this seller's shop
    shop_id = seller.get("shop_id")
    bills = await db.bills.find({"shop_id": shop_id}).to_list(length=None)
    
    # Calculate statistics
    total_sales = seller.get("total_sales", 0)
    total_revenue = seller.get("total_revenue", 0.0)
    total_orders = len(bills)
    
    # Calculate today's sales
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_bills = [b for b in bills if b.get("purchase_date", datetime.min) >= today_start]
    today_revenue = sum(b.get("total_amount", 0) for b in today_bills)
    today_orders = len(today_bills)
    
    # Calculate this week's sales
    week_start = datetime.utcnow() - timedelta(days=7)
    week_bills = [b for b in bills if b.get("purchase_date", datetime.min) >= week_start]
    week_revenue = sum(b.get("total_amount", 0) for b in week_bills)
    
    return {
        "shop_id": shop_id,
        "shop_name": seller.get("shop_name", "My Shop"),
        "total_sales": total_sales,
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "today_revenue": round(today_revenue, 2),
        "today_orders": today_orders,
        "week_revenue": round(week_revenue, 2),
        "average_order_value": round(total_revenue / total_orders, 2) if total_orders > 0 else 0
    }

@router.get("/top-selling")
async def get_top_selling(current_user: str = Depends(get_current_user), db = Depends(get_database)):
    """Get top selling products for seller based on real bills"""
    # Get seller info
    seller = await db.users.find_one({"email": current_user, "role": "seller"})
    
    if not seller:
        return {"products": []}
    
    shop_id = seller.get("shop_id")
    bills = await db.bills.find({"shop_id": shop_id}).to_list(length=None)
    
    # Aggregate product sales
    product_stats = {}
    for bill in bills:
        for item in bill.get("items", []):
            name = item.get("name")
            quantity = item.get("quantity", 1)
            price = item.get("price", 0)
            
            if name not in product_stats:
                product_stats[name] = {"name": name, "sales": 0, "revenue": 0}
            
            product_stats[name]["sales"] += quantity
            product_stats[name]["revenue"] += price * quantity
    
    # Sort by sales and get top 5
    products = sorted(product_stats.values(), key=lambda x: x["sales"], reverse=True)[:5]
    
    return {"products": products}

@router.get("/low-stock")
async def get_low_stock(current_user: str = Depends(get_current_user)):
    # Mock low stock items
    items = [
        {"name": "Milk (1L)", "current_stock": 8, "threshold": 20, "status": "critical"},
        {"name": "Bread", "current_stock": 12, "threshold": 25, "status": "low"},
        {"name": "Eggs", "current_stock": 15, "threshold": 30, "status": "low"},
    ]
    
    return {"items": items}

@router.get("/search-trends")
async def get_search_trends(current_user: str = Depends(get_current_user)):
    # Mock search trends
    trends = [
        {"keyword": "Milk", "searches": 450, "change": "+15%"},
        {"keyword": "Bread", "searches": 380, "change": "+8%"},
        {"keyword": "Eggs", "searches": 320, "change": "-5%"},
        {"keyword": "Chicken", "searches": 280, "change": "+22%"},
        {"keyword": "Rice", "searches": 250, "change": "+12%"},
    ]
    
    return {"trends": trends}

@router.get("/predictions")
async def get_predictions(current_user: str = Depends(get_current_user)):
    """
    AI-powered demand predictions
    In production: use ML models (scikit-learn, TensorFlow, etc.)
    """
    
    # Mock predictions
    predictions = [
        {
            "item": "Milk (1L)",
            "current_demand": 45,
            "predicted_demand": 65,
            "confidence": 0.85,
            "recommendation": "Increase stock by 40%",
            "trend": "up",
            "factors": ["Holiday season", "Price drop", "Weather"]
        },
        {
            "item": "Bread",
            "current_demand": 32,
            "predicted_demand": 28,
            "confidence": 0.78,
            "recommendation": "Reduce stock by 12%",
            "trend": "down",
            "factors": ["Competitor pricing", "Seasonal decline"]
        },
        {
            "item": "Eggs",
            "current_demand": 28,
            "predicted_demand": 38,
            "confidence": 0.92,
            "recommendation": "Increase stock by 35%",
            "trend": "up",
            "factors": ["Upcoming holiday", "Supply shortage"]
        }
    ]
    
    return {"predictions": predictions}

@router.get("/revenue")
async def get_revenue(period: str = "week", current_user: str = Depends(get_current_user)):
    # Mock revenue data
    if period == "week":
        data = [
            {"date": "Mon", "revenue": 1200, "orders": 45},
            {"date": "Tue", "revenue": 1800, "orders": 62},
            {"date": "Wed", "revenue": 1500, "orders": 51},
            {"date": "Thu", "revenue": 2200, "orders": 78},
            {"date": "Fri", "revenue": 2800, "orders": 95},
            {"date": "Sat", "revenue": 3200, "orders": 112},
            {"date": "Sun", "revenue": 2400, "orders": 84},
        ]
    elif period == "month":
        data = [
            {"date": "Week 1", "revenue": 8500, "orders": 312},
            {"date": "Week 2", "revenue": 9200, "orders": 345},
            {"date": "Week 3", "revenue": 8800, "orders": 328},
            {"date": "Week 4", "revenue": 10100, "orders": 378},
        ]
    else:
        data = [
            {"date": "Jan", "revenue": 35200, "orders": 1245},
            {"date": "Feb", "revenue": 38500, "orders": 1356},
            {"date": "Mar", "revenue": 41200, "orders": 1478},
        ]
    
    total_revenue = sum(d["revenue"] for d in data)
    total_orders = sum(d["orders"] for d in data)
    
    return {
        "data": data,
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "average_order_value": total_revenue / total_orders if total_orders > 0 else 0
    }
