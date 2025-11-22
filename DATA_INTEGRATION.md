# Delhi NCR Stores Data Integration

This document explains how the Delhi NCR stores data from `delhi_ncr_stores_data.csv` has been integrated into the Corelia project.

## Data Structure

The CSV file contains **9,400 rows** with the following columns:
- `Store_ID` - Unique identifier for each store (e.g., DEL10000, DEL10001)
- `Store_Name` - Name of the store
- `Owner_Name` - Owner's name
- `Contact_Number` - Contact phone number
- `Store_Type` - Category of store (Jewelry, Footwear Store, Electronics, Department Store, etc.)
- `Location` - Area/locality in Delhi NCR
- `Address` - Full address
- `Item_ID` - Unique identifier for each item
- `Item_Name` - Name of the product
- `Category` - Product category (Groceries, Snacks, Personal Care, Household, Electronics, etc.)
- `Price` - Price in INR
- `Stock_Quantity` - Current stock level

## Database Collections

The data is imported into two MongoDB collections:

### 1. `shops` Collection
Stores unique shop information:
```javascript
{
  store_id: "DEL10000",
  name: "Omaja Jewelry",
  owner_name: "Omaja Mahal",
  contact_number: "9630646849",
  store_type: "Jewelry",
  location: "Sultanpur Majra",
  address: "26, Ramachandran, Sultanpur Majra",
  rating: 4.5,
  is_open: true,
  created_at: ISODate("2025-11-23T..."),
  updated_at: ISODate("2025-11-23T...")
}
```

### 2. `inventory_items` Collection
Stores all inventory items for each shop:
```javascript
{
  store_id: "DEL10000",
  item_id: "GRO008",
  item_name: "Maggi Noodles (70g)",
  category: "Groceries",
  price: 12.86,
  stock_quantity: 69,
  created_at: ISODate("2025-11-23T..."),
  updated_at: ISODate("2025-11-23T...")
}
```

## Import Process

### Step 1: Install Dependencies
Make sure you have the required Python packages:
```bash
cd backend
pip install motor python-dotenv
```

### Step 2: Configure MongoDB
Ensure your `.env` file in the `backend` folder has MongoDB credentials:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=corelia
```

### Step 3: Run the Import Script
```bash
cd backend
python import_shops_data.py
```

The script will:
1. Connect to MongoDB
2. Read the CSV file
3. Clear existing shops and inventory data
4. Import unique shops (150+ stores)
5. Import all inventory items (9,400+ items)
6. Create indexes for better performance
7. Display statistics

## API Endpoints

The following API endpoints now work with real data from the database:

### Get All Shops
```http
GET /api/shops?category=Electronics&location=Dilshad Garden&limit=50
```
Returns shops with optional filters.

### Get Shop Details
```http
GET /api/shops/DEL10000
```
Returns detailed shop information and full inventory.

### Search Shops
```http
GET /api/shops/search/query?q=jewelry
```
Search by name, type, location, or address.

### Match Grocery List
```http
POST /api/shops/match
Content-Type: application/json

{
  "items": ["Maggi Noodles", "Tata Salt", "Amul Milk"],
  "user_location": null
}
```
Returns shops that have the requested items, sorted by best match.

### Get Locations
```http
GET /api/shops/filters/locations
```
Returns all unique locations for filtering.

### Get Categories
```http
GET /api/shops/filters/categories
```
Returns all unique store types/categories.

### Get Statistics
```http
GET /api/shops/stats/overview
```
Returns overall statistics (total shops, items, locations, categories).

## Features Implemented

✅ **Real Data Integration** - All shop and inventory data from CSV
✅ **Smart Search** - Search across names, types, locations, and addresses
✅ **Filtering** - Filter by category and location
✅ **Grocery Matching** - Match user's shopping list with shops
✅ **Inventory Tracking** - Full inventory for each shop with prices and stock
✅ **Database Indexing** - Optimized queries with indexes
✅ **Statistics API** - Get overview of total shops, items, etc.

## Database Indexes

The following indexes are created for performance:
- `shops.store_id` (unique)
- `shops.location`
- `shops.store_type`
- `inventory_items.store_id`
- `inventory_items.item_name`
- `inventory_items.category`

## Example Data

**Sample Shops:**
- Omaja Jewelry (Sultanpur Majra) - Jewelry
- Sanya Footwear Store (Sadar Bazar) - Footwear Store
- Oeshi Electronics (Dilshad Garden) - Electronics
- Aradhana Department Store (Paschim Vihar) - Department Store

**Sample Categories:**
- Groceries (Atta, Rice, Salt, Oil, etc.)
- Snacks (Chips, Biscuits, Beverages)
- Personal Care (Toothpaste, Shampoo, Face Cream)
- Household (Soap, Detergent, Dishwash)
- Electronics (TVs, Laptops, Power Banks)
- Confectionery (Chocolates, Candies)

## Next Steps

1. **Run the import script** to populate your database
2. **Test the API endpoints** using Postman or curl
3. **Update the frontend** to display real shop data
4. **Add user reviews** and ratings functionality
5. **Implement distance calculation** based on user location

## Troubleshooting

**MongoDB Connection Failed:**
- Ensure MongoDB is running locally or update MONGODB_URL in .env
- Check if the port 27017 is accessible

**Import Script Errors:**
- Verify the CSV file path is correct
- Check CSV encoding (should be UTF-8)
- Ensure you have write permissions to the database

**No Data in API Response:**
- Run the import script first: `python import_shops_data.py`
- Check MongoDB connection in the backend
- Verify the database name matches in .env and database.py
