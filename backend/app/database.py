from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
from dotenv import load_dotenv
from fastapi import HTTPException, status

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "corelia")

client: Optional[AsyncIOMotorClient] = None
database = None

async def connect_db():
    global client, database
    try:
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        database = client[DATABASE_NAME]
        # Verify connection
        await client.admin.command('ping')
        print(f"✅ Connected to MongoDB: {DATABASE_NAME}")
        
        # Create indexes for better performance
        await setup_indexes()
        
    except Exception as e:
        print(f"⚠️  MongoDB not available: {e}")
        print(f"⚠️  Running in demo mode without database")
        # Set to None for demo mode
        client = None
        database = None

async def setup_indexes():
    """Create database indexes for optimal performance"""
    global database
    if database is None:
        return
    
    try:
        # Inventory collection indexes
        await database.inventory.create_index("owner_email")
        await database.inventory.create_index([("owner_email", 1), ("category", 1)])
        await database.inventory.create_index([("owner_email", 1), ("name", 1)])
        
        # Review collection indexes
        await database.reviews.create_index("shop_id")
        await database.reviews.create_index([("shop_id", 1), ("created_at", -1)])
        await database.reviews.create_index("user_email")
        await database.reviews.create_index("created_at")
        
        # Review likes indexes
        await database.review_likes.create_index([("review_id", 1), ("user_email", 1)], unique=True)
        
        print("✅ Database indexes created successfully")
    except Exception as e:
        print(f"⚠️  Index creation warning: {e}")

async def close_db():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_database():
    # Return None if database not available (demo mode)
    return database
