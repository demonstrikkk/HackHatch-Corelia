"""
Expiry Logic Utility
Automatically calculates expiry dates based on product categories
"""
from datetime import datetime, timedelta
from typing import Optional

# Expiry duration mapping (in days)
EXPIRY_RULES = {
    # Vegetables & Produce
    "vegetables": 7,
    "produce": 7,
    "fruits": 7,
    "leafy greens": 3,
    "herbs": 5,
    
    # Dairy & Eggs
    "dairy": 7,
    "milk": 7,
    "cheese": 14,
    "yogurt": 14,
    "eggs": 21,
    
    # Meat & Seafood
    "meat": 3,
    "chicken": 2,
    "beef": 3,
    "pork": 3,
    "seafood": 2,
    "fish": 2,
    
    # Bakery
    "bakery": 5,
    "bread": 5,
    "pastries": 3,
    
    # Pantry Items
    "pulses": 120,  # 4 months
    "lentils": 120,
    "beans": 120,
    "rice": 365,  # 1 year
    "flour": 180,  # 6 months
    "sugar": 730,  # 2 years
    "salt": 1825,  # 5 years
    "oil": 365,  # 1 year
    "spices": 365,  # 1 year
    "pasta": 730,  # 2 years
    "cereals": 180,  # 6 months
    
    # Canned & Preserved
    "canned goods": 730,  # 2 years
    "pickles": 365,  # 1 year
    "jam": 180,  # 6 months
    "sauce": 365,  # 1 year
    
    # Beverages
    "juice": 7,
    "soft drinks": 180,
    "water": 365,
    
    # Frozen Items
    "frozen": 90,  # 3 months
    
    # Default
    "default": 30,  # 1 month for unspecified items
}


def calculate_expiry_date(category: str, purchase_date: Optional[datetime] = None) -> datetime:
    """
    Calculate expiry date based on category
    
    Args:
        category: Product category (case-insensitive)
        purchase_date: Date of purchase (defaults to now)
    
    Returns:
        Calculated expiry date
    """
    if purchase_date is None:
        purchase_date = datetime.utcnow()
    
    # Normalize category to lowercase
    category_lower = category.lower().strip()
    
    # Find matching expiry rule
    days_until_expiry = EXPIRY_RULES.get(category_lower, EXPIRY_RULES["default"])
    
    # Check for partial matches if exact match not found
    if category_lower not in EXPIRY_RULES:
        for key, value in EXPIRY_RULES.items():
            if key in category_lower or category_lower in key:
                days_until_expiry = value
                break
    
    return purchase_date + timedelta(days=days_until_expiry)


def get_expiry_info(category: str) -> dict:
    """
    Get expiry information for a category
    
    Args:
        category: Product category
    
    Returns:
        Dictionary with days and human-readable duration
    """
    category_lower = category.lower().strip()
    days = EXPIRY_RULES.get(category_lower, EXPIRY_RULES["default"])
    
    # Check for partial matches
    if category_lower not in EXPIRY_RULES:
        for key, value in EXPIRY_RULES.items():
            if key in category_lower or category_lower in key:
                days = value
                break
    
    # Format human-readable duration
    if days == 1:
        duration = "1 day"
    elif days < 7:
        duration = f"{days} days"
    elif days < 30:
        weeks = days // 7
        duration = f"{weeks} week{'s' if weeks > 1 else ''}"
    elif days < 365:
        months = days // 30
        duration = f"{months} month{'s' if months > 1 else ''}"
    else:
        years = days // 365
        duration = f"{years} year{'s' if years > 1 else ''}"
    
    return {
        "days": days,
        "duration": duration,
        "expiry_date": calculate_expiry_date(category).isoformat()
    }


def get_all_categories_info() -> dict:
    """
    Get expiry information for all categories
    
    Returns:
        Dictionary mapping categories to their expiry info
    """
    return {
        category: {
            "days": days,
            "duration": get_expiry_info(category)["duration"]
        }
        for category, days in EXPIRY_RULES.items()
        if category != "default"
    }
