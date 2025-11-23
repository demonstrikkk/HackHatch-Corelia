# 🕐 Smart Expiry Logic System

## Overview
The system automatically calculates expiry dates based on product categories. When you add an item without specifying an expiry date, the system uses industry-standard shelf life durations.

## Category Expiry Rules

### 🥬 Vegetables & Produce
- **Vegetables / Produce / Fruits**: 7 days (1 week)
- **Leafy Greens**: 3 days
- **Herbs**: 5 days

### 🥛 Dairy & Eggs
- **Dairy / Milk**: 7 days (1 week)
- **Cheese**: 14 days (2 weeks)
- **Yogurt**: 14 days (2 weeks)
- **Eggs**: 21 days (3 weeks)

### 🍖 Meat & Seafood
- **Chicken**: 2 days
- **Beef / Pork / Meat**: 3 days
- **Seafood / Fish**: 2 days

### 🍞 Bakery
- **Bread / Bakery**: 5 days
- **Pastries**: 3 days

### 🌾 Pantry Items (Dry Goods)
- **Pulses / Lentils / Beans**: 120 days (4 months)
- **Rice**: 365 days (1 year)
- **Flour**: 180 days (6 months)
- **Sugar**: 730 days (2 years)
- **Salt**: 1825 days (5 years)
- **Oil**: 365 days (1 year)
- **Spices**: 365 days (1 year)
- **Pasta**: 730 days (2 years)
- **Cereals**: 180 days (6 months)

### 🥫 Canned & Preserved
- **Canned Goods**: 730 days (2 years)
- **Pickles**: 365 days (1 year)
- **Jam**: 180 days (6 months)
- **Sauce**: 365 days (1 year)

### 🥤 Beverages
- **Juice**: 7 days
- **Soft Drinks**: 180 days (6 months)
- **Water**: 365 days (1 year)

### ❄️ Frozen Items
- **Frozen**: 90 days (3 months)

### 📦 Default
- **Unspecified Category**: 30 days (1 month)

## How It Works

### 1. **Adding New Items**
When you add a new inventory item:
- Enter the product name and category
- As you type the category, the system shows the expected shelf life
- You can optionally enter a custom expiry date
- If left blank, the system auto-calculates based on category

### 2. **Category Matching**
The system uses smart matching:
- Exact match: "Dairy" → 7 days
- Partial match: "Fresh Vegetables" → matches "Vegetables" → 7 days
- Case-insensitive: "PULSES" or "pulses" → 120 days
- Default fallback: Unknown category → 30 days

### 3. **Visual Indicators**
Items are color-coded by urgency:
- 🔴 **Red**: Expired (< 0 days)
- 🟠 **Orange**: Critical (≤ 3 days)
- 🟡 **Yellow**: Warning (≤ 7 days)
- ⚪ **Gray**: Normal (> 7 days)

## Examples

### Example 1: Adding Vegetables
```
Category: "Vegetables"
→ Auto-expires in: 7 days
→ Expiry Date: November 30, 2025
```

### Example 2: Adding Pulses
```
Category: "Pulses"
→ Auto-expires in: 4 months
→ Expiry Date: March 23, 2026
```

### Example 3: Adding Milk
```
Category: "Dairy"
→ Auto-expires in: 1 week
→ Expiry Date: November 30, 2025
```

### Example 4: Custom Expiry
```
Category: "Bread"
Expected: 5 days
Manual Override: December 5, 2025
→ Uses your custom date
```

## API Endpoints

### Get Expiry Info for Category
```http
GET /api/inventory/expiry-info/{category}
```

Response:
```json
{
  "success": true,
  "category": "vegetables",
  "expiry_info": {
    "days": 7,
    "duration": "1 week",
    "expiry_date": "2025-11-30T00:00:00"
  }
}
```

### Get All Categories Info
```http
GET /api/inventory/expiry-categories
```

Response:
```json
{
  "success": true,
  "categories": {
    "vegetables": { "days": 7, "duration": "1 week" },
    "pulses": { "days": 120, "duration": "4 months" },
    ...
  },
  "total_categories": 30
}
```

## Benefits

✅ **No Manual Date Entry**: System handles expiry dates automatically
✅ **Industry Standards**: Based on food safety guidelines
✅ **Smart Matching**: Flexible category recognition
✅ **Waste Reduction**: Get alerted before items expire
✅ **Inventory Planning**: Know when to restock
✅ **Cost Savings**: Reduce expired product losses

## Tips for Best Results

1. **Use Standard Categories**: Stick to common names like "Vegetables", "Dairy", "Meat"
2. **Be Specific**: "Leafy Greens" gets 3 days vs "Vegetables" gets 7 days
3. **Override When Needed**: You can always set a custom expiry date
4. **Check Expiring Items**: Visit the "Expiring Items" page regularly
5. **Update Stock**: Remove items once sold to keep tracking accurate

## Future Enhancements

- 📱 Push notifications for expiring items
- 📊 Analytics on waste patterns
- 🤖 AI-powered category detection
- 📸 OCR scanning with auto-categorization
- 🔄 Seasonal adjustments (summer vs winter shelf life)
- 🌡️ Storage condition based expiry (refrigerated vs room temp)
