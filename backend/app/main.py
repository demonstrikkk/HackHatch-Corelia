from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, user, shops, inventory, analytics
from app.database import connect_db, close_db
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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
    logger.info("Starting CORELIA API...")
    await connect_db()
    logger.info("CORELIA API started successfully")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down CORELIA API...")
    await close_db()
    logger.info("CORELIA API shutdown complete")

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
