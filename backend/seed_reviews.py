#!/usr/bin/env python3
"""
Seed initial reviews for the community reviews system
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import random
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "corelia")

# Sample data
SAMPLE_USERS = [
    "Aarav Sharma",
    "Meera Kapoor",
    "Rohan Desai",
    "Priya Verma",
    "Arjun Singh",
    "Ananya Patel",
    "Vikram Reddy",
    "Kavya Nair"
]

SAMPLE_SHOPS = [
    "Urban Trends",
    "Fashify",
    "Green Choice Market",
    "The Style Room",
    "Fresh Mart",
    "Quick Stop",
    "Organic Valley",
    "Metro Fashion Hub"
]

SAMPLE_COMMENTS = [
    "Absolutely loved the experience! The AI recommendations actually matched my style perfectly. It felt like shopping with a friend who knows me.",
    "Corelia's virtual try-on feature saved me from so many bad fashion decisions 😂. Also, the cashback points are a nice touch.",
    "Great integration of local stores! I could find eco-friendly products near me without hopping through a dozen sites.",
    "The AI chatbot was super helpful — answered all my size and return queries instantly. Kudos to Corelia's support system!",
    "Excellent service and fresh products! The personalized deals really made a difference in my shopping experience.",
    "Best grocery shopping experience I've had online. The AI knew exactly what I needed based on my previous orders.",
    "Love how Corelia connects me with local businesses. Found amazing products I wouldn't have discovered otherwise!",
    "The smart recommendations are spot on. Saved me so much time finding exactly what I was looking for.",
    "Great variety and the interface is so smooth. Makes shopping a breeze!",
    "Impressed with the quality of service. Will definitely be shopping here again!",
    "The loyalty program is fantastic. Getting rewarded for shopping local is a win-win!",
    "Found some hidden gems through Corelia. The shop directory is incredibly useful.",
    "Customer service is top-notch. Had an issue and it was resolved within minutes.",
    "Love supporting local businesses through this platform. Keep up the great work!",
    "The personalized experience makes all the difference. Feels like the platform really understands my needs."
]

async def seed_reviews():
    """Seed initial reviews into the database"""
    print("🌱 Seeding community reviews...")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    try:
        # Clear existing reviews
        await db.reviews.delete_many({})
        await db.review_likes.delete_many({})
        print("✅ Cleared existing reviews")
        
        # Generate reviews
        reviews = []
        current_time = datetime.utcnow()
        
        for i in range(30):
            days_ago = random.randint(1, 90)
            created_at = current_time - timedelta(days=days_ago)
            
            review = {
                "shop_id": f"shop_{random.randint(1, len(SAMPLE_SHOPS))}",
                "shop_name": random.choice(SAMPLE_SHOPS),
                "user_name": random.choice(SAMPLE_USERS),
                "user_email": f"user{i+1}@example.com",
                "rating": round(random.uniform(3.5, 5.0), 1),
                "comment": random.choice(SAMPLE_COMMENTS),
                "likes": random.randint(0, 150),
                "comments_count": random.randint(0, 20),
                "created_at": created_at,
                "updated_at": created_at
            }
            reviews.append(review)
        
        # Insert reviews
        result = await db.reviews.insert_many(reviews)
        print(f"✅ Inserted {len(result.inserted_ids)} reviews")
        
        # Get stats
        total_reviews = await db.reviews.count_documents({})
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "avg_rating": {"$avg": "$rating"},
                    "total_likes": {"$sum": "$likes"}
                }
            }
        ]
        
        stats_cursor = db.reviews.aggregate(pipeline)
        stats_list = await stats_cursor.to_list(length=1)
        stats = stats_list[0] if stats_list else {"avg_rating": 0, "total_likes": 0}
        
        print(f"\n📊 Statistics:")
        print(f"   Total reviews: {total_reviews}")
        print(f"   Average rating: {stats.get('avg_rating', 0):.1f}/5.0")
        print(f"   Total likes: {stats.get('total_likes', 0)}")
        
        print("\n🎉 Seeding complete!")
        
    except Exception as e:
        print(f"❌ Error seeding reviews: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_reviews())
