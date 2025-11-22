from fastapi import APIRouter, Depends
from app.database import get_database
from app.utils.auth import get_current_user
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/top-selling")
async def get_top_selling(current_user: str = Depends(get_current_user)):
    # Mock top selling products
    products = [
        {"name": "Milk", "sales": 145, "revenue": 579.55},
        {"name": "Bread", "sales": 132, "revenue": 328.68},
        {"name": "Eggs", "sales": 98, "revenue": 489.02},
        {"name": "Chicken", "sales": 87, "revenue": 1129.13},
        {"name": "Rice", "sales": 76, "revenue": 1215.24},
    ]
    
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
