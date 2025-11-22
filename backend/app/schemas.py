from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: str = "customer"  # customer or seller

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

class ShopBase(BaseModel):
    name: str
    category: str
    address: str
    phone: str
    latitude: float
    longitude: float
    operating_hours: str
    rating: float = 4.0

class ShopCreate(ShopBase):
    owner_id: str

class ShopResponse(ShopBase):
    id: str
    owner_id: str
    is_open: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

class InventoryItemBase(BaseModel):
    name: str
    category: str
    price: float
    stock: int
    unit: str
    expiry_date: Optional[datetime] = None

class InventoryItemCreate(InventoryItemBase):
    shop_id: str

class InventoryItemResponse(InventoryItemBase):
    id: str
    shop_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GroceryListItem(BaseModel):
    name: str
    quantity: Optional[int] = 1

class ShopMatchRequest(BaseModel):
    items: List[str]
    user_location: Optional[dict] = None

class ShopMatchResponse(BaseModel):
    shop_id: str
    shop_name: str
    total_price: float
    distance: float
    availability: float
    rating: float
    matched_items: int
    missing_items: List[str]

class ReviewBase(BaseModel):
    shop_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: str
    verified: bool = False

class ReviewCreate(ReviewBase):
    user_id: str

class ReviewResponse(ReviewBase):
    id: str
    user_id: str
    user_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class LoyaltyPoints(BaseModel):
    user_id: str
    points: int = 0
    tier: str = "bronze"  # bronze, silver, gold, platinum

class OCRUploadResponse(BaseModel):
    success: bool
    items: List[dict]
    total_items: int
