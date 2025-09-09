"""
Test endpoints for debugging and creating test accounts
"""
from fastapi import APIRouter, HTTPException, Request
from database import fallback_db, is_using_fallback
from auth_utils import hash_password
import logging
import os

router = APIRouter(prefix="/api/test", tags=["test"])

logger = logging.getLogger(__name__)

@router.post("/create-test-user")
async def create_test_user():
    """Create a test user account for debugging"""
    if not is_using_fallback():
        raise HTTPException(status_code=400, detail="Test user creation only available in fallback mode")
    
    test_email = "test@example.com"
    test_password = "password123"
    
    # Check if test user already exists
    existing_user = fallback_db.get_user_by_email(test_email)
    if existing_user:
        return {
            "message": "Test user already exists",
            "email": test_email,
            "password": test_password,
            "user_id": existing_user['id']
        }
    
    # Create test user
    password_hash = hash_password(test_password)
    user_data = {
        'email': test_email,
        'password_hash': password_hash
    }
    user = fallback_db.create_user(user_data)
    
    logger.info(f"Created test user: {user['id']} - {user['email']}")
    
    return {
        "message": "Test user created successfully",
        "email": test_email,
        "password": test_password,
        "user_id": user['id']
    }

@router.get("/database-status")
async def get_database_status():
    """Get current database status and configuration"""
    return {
        "using_fallback": is_using_fallback(),
        "fallback_users_count": len(fallback_db.users),
        "fallback_tasks_count": len(fallback_db.tasks),
        "users": list(fallback_db.users.values()) if is_using_fallback() else []
    }

@router.get("/test-signup")
async def test_signup():
    """Test signup endpoint with debug info"""
    return {
        "message": "Test signup endpoint",
        "fallback_mode": is_using_fallback(),
        "hash_function_available": callable(hash_password),
        "fallback_db_available": fallback_db is not None
    }

@router.post("/test-task-creation")
async def test_task_creation():
    """Test task creation with minimal data"""
    try:
        # Create a simple test task
        test_task_data = {
            'user_id': 'test-user-1',
            'title': 'Test Task',
            'status': 'pending',
            'dueAt': None,
            'isStarred': False,
            'category': None,
            'parent_id': None
        }
        
        if is_using_fallback():
            created_task = fallback_db.create_task(test_task_data)
            return {
                "success": True,
                "message": "Test task created successfully",
                "task": created_task
            }
        else:
            return {
                "success": False,
                "message": "Not using fallback database"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }

@router.get("/test-auth")
async def test_auth():
    """Test authentication without requiring auth"""
    return {
        "message": "Auth test endpoint - no auth required",
        "secret_key_configured": bool(os.getenv("SECRET_KEY")),
        "secret_key_preview": os.getenv("SECRET_KEY", "")[:10] + "..." if os.getenv("SECRET_KEY") else "Not set"
    }

@router.get("/test-token")
async def test_token(request: Request):
    """Test if token is being sent in request"""
    auth_header = request.headers.get("Authorization")
    return {
        "message": "Token test endpoint",
        "auth_header": auth_header,
        "has_bearer": auth_header and auth_header.startswith("Bearer ") if auth_header else False,
        "token_preview": auth_header[7:27] + "..." if auth_header and len(auth_header) > 27 else "No token or too short"
    }

@router.post("/setup-supabase")
async def setup_supabase():
    """Setup Supabase tables and test connection"""
    try:
        from database import supabase_client, is_using_fallback
        
        if is_using_fallback():
            return {
                "success": False,
                "message": "Using fallback database, not Supabase"
            }
        
        # Test connection
        test_response = supabase_client.table('tasks').select('id').limit(1).execute()
        
        return {
            "success": True,
            "message": "Supabase connection successful",
            "tasks_table_exists": True,
            "test_query_result": test_response.data
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Supabase setup failed - check your configuration and run the SQL setup script"
        }

@router.post("/test-crud-no-auth")
async def test_crud_no_auth():
    """Test CRUD operations without authentication"""
    try:
        from database import supabase_client, is_using_fallback
        
        if is_using_fallback():
            # Test fallback database
            test_task_data = {
                'user_id': 'test-user-crud',
                'title': 'Test CRUD Task',
                'status': 'pending',
                'dueAt': None,
                'isStarred': False,
                'category': 'test',
                'parent_id': None
            }
            
            created_task = fallback_db.create_task(test_task_data)
            return {
                "success": True,
                "message": "Fallback CRUD test successful",
                "task": created_task
            }
        else:
            # Test Supabase
            test_task_data = {
                'user_id': 'test-user-crud',
                'title': 'Test CRUD Task',
                'status': 'pending',
                'dueAt': None,
                'isStarred': False,
                'category': 'test',
                'parent_id': None
            }
            
            # Try to create a task
            response = supabase_client.table('tasks').insert(test_task_data).execute()
            
            if response.data:
                return {
                    "success": True,
                    "message": "Supabase CRUD test successful",
                    "task": response.data[0]
                }
            else:
                return {
                    "success": False,
                    "message": "Supabase insert returned no data",
                    "response": response
                }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__,
            "message": "CRUD test failed"
        }
