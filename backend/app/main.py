from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, user, shops, inventory, analytics
from app.database import connect_db, close_db

app = FastAPI(
    title="CORELIA API",
    description="Next-Gen Retail Intelligence Platform API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Events
@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(shops.router, prefix="/api/shops", tags=["Shops"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to CORELIA API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
