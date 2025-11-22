"""
Script to import Delhi NCR stores data from CSV into MongoDB
Handles both shops and their inventory items
"""
import asyncio
import csv
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "corelia")

async def import_csv_data():
    """Import shops and inventory from delhi_ncr_stores_data.csv"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print(f"Connected to MongoDB: {DATABASE_NAME}")
    
    # Read CSV file
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'delhi_ncr_stores_data.csv')
    
    shops_dict = {}  # Store unique shops by Store_ID
    inventory_items = []  # All inventory items
    
    print(f"Reading CSV file: {csv_path}")
    
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        row_count = 0
        
        for row in reader:
            row_count += 1
            store_id = row['Store_ID']
            
            # Create or update shop entry
            if store_id not in shops_dict:
                shops_dict[store_id] = {
                    'store_id': store_id,
                    'name': row['Store_Name'],
                    'owner_name': row['Owner_Name'],
                    'contact_number': row['Contact_Number'],
                    'store_type': row['Store_Type'],
                    'location': row['Location'],
                    'address': row['Address'],
                    'rating': round(4.0 + (hash(store_id) % 10) / 10, 1),  # Generate rating 4.0-4.9
                    'is_open': True,
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow(),
                }
            
            # Create inventory item
            inventory_item = {
                'store_id': store_id,
                'item_id': row['Item_ID'],
                'item_name': row['Item_Name'],
                'category': row['Category'],
                'price': float(row['Price']),
                'stock_quantity': int(row['Stock_Quantity']),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
            }
            inventory_items.append(inventory_item)
            
            if row_count % 1000 == 0:
                print(f"Processed {row_count} rows...")
    
    print(f"Total rows processed: {row_count}")
    print(f"Unique shops: {len(shops_dict)}")
    print(f"Total inventory items: {len(inventory_items)}")
    
    # Clear existing data
    print("\nClearing existing shops and inventory...")
    await db.shops.delete_many({})
    await db.inventory_items.delete_many({})
    
    # Insert shops
    print(f"\nInserting {len(shops_dict)} shops...")
    shops_list = list(shops_dict.values())
    if shops_list:
        result = await db.shops.insert_many(shops_list)
        print(f"Inserted {len(result.inserted_ids)} shops")
    
    # Insert inventory items in batches
    print(f"\nInserting {len(inventory_items)} inventory items...")
    batch_size = 1000
    for i in range(0, len(inventory_items), batch_size):
        batch = inventory_items[i:i+batch_size]
        await db.inventory_items.insert_many(batch)
        print(f"Inserted batch {i//batch_size + 1}: {len(batch)} items")
    
    # Create indexes for better query performance
    print("\nCreating indexes...")
    await db.shops.create_index("store_id", unique=True)
    await db.shops.create_index("location")
    await db.shops.create_index("store_type")
    await db.inventory_items.create_index("store_id")
    await db.inventory_items.create_index("item_name")
    await db.inventory_items.create_index("category")
    
    print("\n✅ Data import completed successfully!")
    
    # Show some stats
    shop_count = await db.shops.count_documents({})
    item_count = await db.inventory_items.count_documents({})
    print(f"\nDatabase statistics:")
    print(f"  - Shops: {shop_count}")
    print(f"  - Inventory items: {item_count}")
    
    # Show sample data
    print("\nSample shops:")
    async for shop in db.shops.find().limit(3):
        print(f"  - {shop['name']} ({shop['store_type']}) - {shop['location']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(import_csv_data())
