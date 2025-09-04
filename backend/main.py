from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from routers import tasks, auth, emails
from database import supabase_client, fallback_db, is_using_fallback
from models import User
import jwt

load_dotenv()

# JWT configuration for fallback database
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

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
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user from JWT token"""
    try:
        if is_using_fallback():
            # Verify JWT token for fallback database
            try:
                payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
                user_id = payload.get("sub")
                email = payload.get("email")
                if user_id is None or email is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid authentication credentials",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                
                user = fallback_db.get_user_by_id(user_id)
                if user is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User not found",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                
                return User(
                    id=user['id'],
                    email=user['email'],
                    created_at=user['created_at']
                )
            except jwt.ExpiredSignatureError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expired",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            except jwt.JWTError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        else:
            # Verify JWT token with Supabase
            response = supabase_client.auth.get_user(credentials.credentials)
            if response.user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            return User(
                id=response.user.id,
                email=response.user.email,
                created_at=response.user.created_at
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
        )

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(emails.router, prefix="/api/emails", tags=["emails"])

@app.get("/")
async def root():
    return {"message": "Sentinel API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "sentinel-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)