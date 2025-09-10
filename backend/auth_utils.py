from fastapi import Request, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import supabase_client, fallback_db, is_using_fallback
from models import User
import jwt
import os

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

security = HTTPBearer()

async def get_current_user_flexible(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Authentication function that works with both JWT tokens and fallback database
    """
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
            try:
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
            except Exception as e:
                print(f"Supabase auth error: {e}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )