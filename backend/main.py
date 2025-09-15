"""
Sentinel Todo App - FastAPI Backend
===================================

This is the main FastAPI application for the Sentinel Todo App.

REAL FUNCTIONALITY:
- Task management with Supabase database
- User authentication and authorization
- Category management (user-specific)
- Email integration and task suggestions
- Row Level Security (RLS) for data protection

MOCK FUNCTIONALITY:
- Fallback database for development
- Test endpoints for demonstration
- Guest mode support

Deployment: Render (https://render.com)
Database: Supabase (https://supabase.com)
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from routers import tasks, auth, emails, test, categories
from auth_utils import get_current_user_flexible
from database import is_using_fallback

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if is_using_fallback():
        print("Starting up FastAPI server with SQLite fallback database...")
    else:
        print("Starting up FastAPI server with Supabase database...")
    yield
    # Shutdown
    print("Shutting down FastAPI server...")

app = FastAPI(
    title="Sentinel API",
    description="Backend API for Sentinel productivity application",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000",
        "https://todolistprototype-henna.vercel.app"  # Vercel frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session middleware for merge compatibility
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv('SESSION_SECRET_KEY', 'dev-key-change-in-production'),
    same_site='lax',
    https_only=False
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(emails.router)
app.include_router(categories.router)
app.include_router(test.router)

@app.get("/")
async def root():
    return {"message": "Sentinel API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "sentinel-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)