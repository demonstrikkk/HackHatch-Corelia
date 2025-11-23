from fastapi import APIRouter, Depends, HTTPException
from app.database import get_database
from app.utils.auth import get_current_user
from datetime import datetime
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/shop/{shop_id}")
async def get_shop_reviews(
    shop_id: str,
    limit: int = 50,
    db = Depends(get_database)
):
    """Get all reviews for a specific shop"""
    try:
        reviews_cursor = db.reviews.find({"shop_id": shop_id}).sort("created_at", -1).limit(limit)
        reviews = await reviews_cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for review in reviews:
            if "_id" in review:
                review["_id"] = str(review["_id"])
        
        logger.info(f"Retrieved {len(reviews)} reviews for shop {shop_id}")
        
        return {
            "success": True,
            "reviews": reviews,
            "total": len(reviews)
        }
        
    except Exception as e:
        logger.error(f"Get Shop Reviews Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch reviews: {str(e)}")

@router.get("/all")
async def get_all_reviews(
    limit: int = 20,
    db = Depends(get_database)
):
    """Get recent reviews from all shops"""
    try:
        reviews_cursor = db.reviews.find({}).sort("created_at", -1).limit(limit)
        reviews = await reviews_cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for review in reviews:
            if "_id" in review:
                review["_id"] = str(review["_id"])
        
        logger.info(f"Retrieved {len(reviews)} recent reviews")
        
        return {
            "success": True,
            "reviews": reviews,
            "total": len(reviews)
        }
        
    except Exception as e:
        logger.error(f"Get All Reviews Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch reviews: {str(e)}")

@router.post("/")
async def create_review(
    review: dict,
    current_user: str = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new review"""
    try:
        review_data = {
            "shop_id": review.get("shop_id"),
            "shop_name": review.get("shop_name"),
            "user_name": review.get("user_name", "Anonymous"),
            "user_email": current_user,
            "rating": review.get("rating", 5),
            "comment": review.get("comment", ""),
            "likes": 0,
            "comments_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.reviews.insert_one(review_data)
        
        logger.info(f"Created review {result.inserted_id} for shop {review_data['shop_id']}")
        
        return {
            "success": True,
            "review_id": str(result.inserted_id),
            "message": "Review created successfully"
        }
        
    except Exception as e:
        logger.error(f"Create Review Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")

@router.put("/{review_id}/like")
async def like_review(
    review_id: str,
    current_user: str = Depends(get_current_user),
    db = Depends(get_database)
):
    """Like a review"""
    try:
        from bson import ObjectId
        
        # Check if user already liked this review
        existing_like = await db.review_likes.find_one({
            "review_id": review_id,
            "user_email": current_user
        })
        
        if existing_like:
            # Unlike
            await db.review_likes.delete_one({
                "review_id": review_id,
                "user_email": current_user
            })
            
            await db.reviews.update_one(
                {"_id": ObjectId(review_id)},
                {"$inc": {"likes": -1}}
            )
            
            logger.info(f"User {current_user} unliked review {review_id}")
            return {"success": True, "liked": False, "message": "Review unliked"}
        else:
            # Like
            await db.review_likes.insert_one({
                "review_id": review_id,
                "user_email": current_user,
                "created_at": datetime.utcnow()
            })
            
            await db.reviews.update_one(
                {"_id": ObjectId(review_id)},
                {"$inc": {"likes": 1}}
            )
            
            logger.info(f"User {current_user} liked review {review_id}")
            return {"success": True, "liked": True, "message": "Review liked"}
        
    except Exception as e:
        logger.error(f"Like Review Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to like review: {str(e)}")

@router.get("/stats")
async def get_review_stats(db = Depends(get_database)):
    """Get community statistics"""
    try:
        # Get total reviews
        total_reviews = await db.reviews.count_documents({})
        
        # Get average rating
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
        
        # Get top shops by rating
        top_shops_pipeline = [
            {
                "$group": {
                    "_id": "$shop_name",
                    "avg_rating": {"$avg": "$rating"},
                    "review_count": {"$sum": 1}
                }
            },
            {"$sort": {"avg_rating": -1}},
            {"$limit": 3}
        ]
        
        top_shops_cursor = db.reviews.aggregate(top_shops_pipeline)
        top_shops = await top_shops_cursor.to_list(length=3)
        
        # Get top contributors
        top_contributors_pipeline = [
            {
                "$group": {
                    "_id": "$user_name",
                    "review_count": {"$sum": 1},
                    "total_likes": {"$sum": "$likes"}
                }
            },
            {"$sort": {"total_likes": -1}},
            {"$limit": 3}
        ]
        
        top_contributors_cursor = db.reviews.aggregate(top_contributors_pipeline)
        top_contributors = await top_contributors_cursor.to_list(length=3)
        
        # Calculate points (likes * 10 + reviews * 20)
        for contributor in top_contributors:
            contributor["points"] = contributor["total_likes"] * 10 + contributor["review_count"] * 20
        
        logger.info("Retrieved review statistics")
        
        return {
            "success": True,
            "stats": {
                "total_reviews": total_reviews,
                "average_rating": round(stats.get("avg_rating", 0), 1),
                "total_likes": stats.get("total_likes", 0),
                "top_shops": [shop["_id"] for shop in top_shops],
                "top_contributors": top_contributors
            }
        }
        
    except Exception as e:
        logger.error(f"Get Review Stats Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: str = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a review (only by owner)"""
    try:
        from bson import ObjectId
        
        result = await db.reviews.delete_one({
            "_id": ObjectId(review_id),
            "user_email": current_user
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Review not found or unauthorized")
        
        logger.info(f"Deleted review {review_id} by user {current_user}")
        
        return {
            "success": True,
            "message": "Review deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete Review Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete review: {str(e)}")
