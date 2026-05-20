from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import settings

from app.api.endpoints import auth, worship, setoran

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Enterprise Quranic SuperApp API (FastAPI + Pydantic V2)"
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(worship.router, prefix=f"{settings.API_V1_STR}/worship", tags=["worship"])
app.include_router(setoran.router, prefix=f"{settings.API_V1_STR}/setoran", tags=["setoran"])

# Ensure static/uploads exists
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set CORS enabled origins (allow "*" fallback for smooth local testing and deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.BACKEND_CORS_ORIGINS) if settings.BACKEND_CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timezone": "UTC",
        "message": "API is running. Awaiting connections."
    }
