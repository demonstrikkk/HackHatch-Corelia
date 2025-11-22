"""
Quick verification script to check if data was imported correctly
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "corelia")

async def verify_data():
    """Verify the imported data"""
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        print("🔍 Verifying data import...")
        print("=" * 50)
        
        # Check shops
        shop_count = await db.shops.count_documents({})
        print(f"\n✅ Shops: {shop_count}")
        
        if shop_count > 0:
            # Get sample shop
            sample_shop = await db.shops.find_one()
            print(f"   Sample: {sample_shop['name']} - {sample_shop['location']}")
        
        # Check inventory
        item_count = await db.inventory_items.count_documents({})
        print(f"\n✅ Inventory Items: {item_count}")
        
        if item_count > 0:
            # Get sample item
            sample_item = await db.inventory_items.find_one()
            print(f"   Sample: {sample_item['item_name']} - ₹{sample_item['price']}")
        
        # Get unique locations
        locations = await db.shops.distinct("location")
        print(f"\n✅ Locations: {len(locations)}")
        print(f"   Examples: {', '.join(locations[:5])}")
        
        # Get unique store types
        categories = await db.shops.distinct("store_type")
        print(f"\n✅ Store Types: {len(categories)}")
        print(f"   Examples: {', '.join(categories[:5])}")
        
        # Get unique item categories
        item_categories = await db.inventory_items.distinct("category")
        print(f"\n✅ Product Categories: {len(item_categories)}")
        print(f"   Examples: {', '.join(item_categories[:5])}")
        
        print("\n" + "=" * 50)
        
        if shop_count > 0 and item_count > 0:
            print("✅ Data verification PASSED!")
            print("\nYou can now:")
            print("1. Start the backend: uvicorn app.main:app --reload")
            print("2. Visit API docs: http://localhost:8000/docs")
            print("3. Test endpoints: http://localhost:8000/api/shops")
        else:
            print("❌ Data verification FAILED!")
            print("Run the import script: python import_shops_data.py")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("1. MongoDB is running")
        print("2. .env file has correct MONGODB_URL")
        print("3. You have network connectivity")

if __name__ == "__main__":
    asyncio.run(verify_data())
