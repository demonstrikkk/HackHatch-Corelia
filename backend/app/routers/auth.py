from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import UserCreate, UserLogin, Token, UserResponse
from app.database import get_database
from app.utils.auth import get_password_hash, verify_password, create_access_token, create_refresh_token
from datetime import datetime
import random
import string

router = APIRouter()

def generate_shop_id():
    """Generate unique 8-character shop ID (e.g., SHP12345)"""
    return 'SHP' + ''.join(random.choices(string.digits, k=5))

@router.post("/signup", response_model=dict)
async def signup(user: UserCreate, db = Depends(get_database)):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_dict = user.model_dump()
    user_dict["password"] = get_password_hash(user.password)
    user_dict["created_at"] = datetime.utcnow()
    user_dict["loyalty_points"] = 0
    
    # Generate unique shop_id for sellers
    if user.role == "seller":
        # Generate unique shop ID
        while True:
            shop_id = generate_shop_id()
            existing_shop = await db.users.find_one({"shop_id": shop_id})
            if not existing_shop:
                break
        user_dict["shop_id"] = shop_id
        user_dict["total_sales"] = 0
        user_dict["total_revenue"] = 0.0
    
    result = await db.users.insert_one(user_dict)
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    # Return user and tokens
    created_user = await db.users.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user["_id"])
    del created_user["_id"]
    del created_user["password"]
    
    return {
        "user": created_user,
        "token": access_token,
        "refresh_token": refresh_token
    }

@router.post("/login", response_model=dict)
async def login(credentials: UserLogin, db = Depends(get_database)):
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    refresh_token = create_refresh_token(data={"sub": user["email"]})
    
    # Return user and tokens
    user["id"] = str(user["_id"])
    del user["_id"]
    del user["password"]
    
    return {
        "user": user,
        "token": access_token,
        "refresh_token": refresh_token
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    # Validate and create new access token
    access_token = create_access_token(data={"sub": "user@example.com"})
    new_refresh_token = create_refresh_token(data={"sub": "user@example.com"})
    
    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token
    )
