from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import fields, clusters, buyers, routes, analytics, websockets
import asyncio

from app.db.database import engine, Base
import app.db.models  # Ensures models are registered before create_all

# Create tables in the PostGIS database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for StubbleConnect AI Biomass Logistics Platform (SIH 2026)"
)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(websockets.simulate_truck_movement())

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 Routers
app.include_router(fields.router, prefix=settings.API_V1_STR)
app.include_router(clusters.router, prefix=settings.API_V1_STR)
app.include_router(buyers.router, prefix=settings.API_V1_STR)
app.include_router(routes.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(websockets.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to StubbleConnect Command Center API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "stubble-connect-backend"}
