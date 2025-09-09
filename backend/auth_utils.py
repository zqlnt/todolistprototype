from fastapi import Request, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import supabase_client, fallback_db, is_using_fallback
from models import User
import jwt
import os

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

security = HTTPBearer()

async def get_current_user_flexible(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Compatible auth function that can work with both:
    - Your existing JWT system
    - Session-based auth (for future merge)
    """
    
    print(f"DEBUG: Auth attempt - Token: {credentials.credentials[:20]}..." if credentials.credentials else "No token")
    print(f"DEBUG: Using fallback: {is_using_fallback()}")
    
    # Try JWT first (your current system)
    try:
        if is_using_fallback():
            # Verify JWT token for fallback database
            try:
                payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
                print(f"DEBUG: JWT payload: {payload}")
                user_id = payload.get("sub")
                email = payload.get("email")
                if user_id is None or email is None:
                    print(f"DEBUG: Missing user_id or email in payload")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid authentication credentials",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                
                user = fallback_db.get_user_by_id(user_id)
                if user is None:
                    print(f"DEBUG: User not found in database: {user_id}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User not found",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                
                print(f"DEBUG: Authentication successful for user: {user_id}")
                return User(
                    id=user['id'],
                    email=user['email'],
                    created_at=user['created_at']
                )
            except jwt.ExpiredSignatureError:
                print(f"DEBUG: JWT token expired")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expired",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            except jwt.JWTError as e:
                print(f"DEBUG: JWT decode error: {e}")
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
        # Session fallback (for merge compatibility)
        session_data = request.session.get('credentials')
        if session_data:
            # Future merge point - return session-based user
            # For now, create a compatible User object from session data
            return User(
                id=session_data.get('user_id', 'session-user'),
                email=session_data.get('email', 'session@example.com'),
                created_at=session_data.get('created_at', '2024-01-01T00:00:00Z')
            )
        
        # If neither works, maintain your current behavior
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )