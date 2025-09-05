from fastapi import APIRouter, HTTPException, status
from fastapi import Request
from pydantic import BaseModel
from database import supabase_client, fallback_db, is_using_fallback
from auth_utils import SECRET_KEY, ALGORITHM
import hashlib
import jwt
from datetime import datetime, timedelta
import os

router = APIRouter(prefix="/api/auth", tags=["authentication"])

ACCESS_TOKEN_EXPIRE_MINUTES = 30

class SignInRequest(BaseModel):
    email: str
    password: str

class SignUpRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

def hash_password(password: str) -> str:
    """Hash password for fallback database"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict):
    """Create JWT access token for fallback database"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password for fallback database"""
    return hash_password(plain_password) == hashed_password

@router.post("/signin", response_model=AuthResponse)
async def sign_in(request: Request, signin_request: SignInRequest):
    """Sign in user with email and password"""
    try:
        if is_using_fallback():
            # Use fallback database
            user = fallback_db.get_user_by_email(signin_request.email)
            if not user or not verify_password(signin_request.password, user['password_hash']):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )
            
            access_token = create_access_token(data={"sub": user['id'], "email": user['email']})
            return AuthResponse(
                access_token=access_token,
                user={
                    "id": user['id'],
                    "email": user['email'],
                    "created_at": user['created_at']
                }
            )
        else:
            # Use Supabase
            response = supabase_client.auth.sign_in_with_password({
                "email": signin_request.email,
                "password": signin_request.password
            })
            
            if response.user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )
            
            return AuthResponse(
                access_token=response.session.access_token,
                user={
                    "id": response.user.id,
                    "email": response.user.email,
                    "created_at": response.user.created_at
                }
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/signup", response_model=AuthResponse)
async def sign_up(request: Request, signup_request: SignUpRequest):
    """Sign up new user with email and password"""
    try:
        if is_using_fallback():
            # Check if user already exists
            existing_user = fallback_db.get_user_by_email(signup_request.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User already exists"
                )
            
            # Create new user
            password_hash = hash_password(signup_request.password)
            user_data = {
                'email': signup_request.email,
                'password_hash': password_hash
            }
            user = fallback_db.create_user(user_data)
            
            access_token = create_access_token(data={"sub": user['id'], "email": user['email']})
            return AuthResponse(
                access_token=access_token,
                user=user
            )
        else:
            # Use Supabase
            response = supabase_client.auth.sign_up({
                "email": signup_request.email,
                "password": signup_request.password
            })
            
            if response.user is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create user"
                )
            
            # Return session if user is immediately confirmed
            if response.session:
                return AuthResponse(
                    access_token=response.session.access_token,
                    user={
                        "id": response.user.id,
                        "email": response.user.email,
                        "created_at": response.user.created_at
                    }
                )
            else:
                # User needs email confirmation
                raise HTTPException(
                    status_code=status.HTTP_201_CREATED,
                    detail="User created. Please check your email for confirmation."
                )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/signout")
async def sign_out(request: Request):
    """Sign out current user"""
    try:
        if not is_using_fallback():
            supabase_client.auth.sign_out()
        return {"message": "Successfully signed out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/user")
async def get_user(request: Request, token: str):
    """Get user information from token"""
    try:
        if is_using_fallback():
            # Decode JWT token
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            user = fallback_db.get_user_by_id(user_id)
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
            
            return {
                "id": user['id'],
                "email": user['email'],
                "created_at": user['created_at']
            }
        else:
            # Use Supabase
            response = supabase_client.auth.get_user(token)
            if response.user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            return {
                "id": response.user.id,
                "email": response.user.email,
                "created_at": response.user.created_at
            }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )