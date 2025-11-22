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
        print(f"Connected to MongoDB: {DATABASE_NAME}")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise

async def close_db():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_database():
    if database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not established"
        )
    return database
