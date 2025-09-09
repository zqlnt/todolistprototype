"""
Database configuration and utilities for Sentinel FastAPI backend
"""
import os
from supabase import create_client, Client
from typing import Dict, List, Any, Optional
import json
from datetime import datetime

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# Initialize Supabase client
supabase_client: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
        supabase_client = None

# Fallback in-memory database for development/testing
class FallbackDatabase:
    def __init__(self):
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.users: Dict[str, Dict[str, Any]] = {}
        self._next_task_id = 1
        self._next_user_id = 1
    
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user in fallback database"""
        user_id = str(self._next_user_id)
        self._next_user_id += 1
        
        user = {
            'id': user_id,
            'email': user_data['email'],
            'name': user_data.get('name', ''),
            'password_hash': user_data.get('password_hash', ''),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        self.users[user_id] = user
        return user
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        for user in self.users.values():
            if user['email'] == email:
                return user
        return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        return self.users.get(user_id)
    
    def create_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new task"""
        task_id = str(self._next_task_id)
        self._next_task_id += 1
        
        task = {
            'id': task_id,
            'user_id': task_data['user_id'],
            'title': task_data['title'],
            'status': task_data.get('status', 'pending'),
            'dueAt': task_data.get('dueAt'),
            'isStarred': task_data.get('isStarred', False),
            'category': task_data.get('category'),
            'parent_id': task_data.get('parent_id'),
            'inserted_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        self.tasks[task_id] = task
        return task
    
    def get_tasks_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all tasks for a user"""
        user_tasks = [task for task in self.tasks.values() if task['user_id'] == user_id]
        # Sort by starred first, then by due date
        user_tasks.sort(key=lambda x: (not x['isStarred'], x.get('dueAt', '')))
        return user_tasks
    
    def update_task(self, task_id: str, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a task"""
        if task_id not in self.tasks:
            return None
        
        task = self.tasks[task_id]
        if task['user_id'] != user_id:
            return None
        
        # Update fields
        for key, value in update_data.items():
            if key in task:
                task[key] = value
        
        task['updated_at'] = datetime.now().isoformat()
        return task
    
    def delete_task(self, task_id: str, user_id: str) -> bool:
    """Delete a task"""
        if task_id not in self.tasks:
            return False
        
        task = self.tasks[task_id]
        if task['user_id'] != user_id:
            return False
        
        del self.tasks[task_id]
        return True

# Initialize fallback database
fallback_db = FallbackDatabase()

def is_using_fallback() -> bool:
    """Check if we should use the fallback database instead of Supabase"""
    return supabase_client is None or not SUPABASE_URL or not SUPABASE_KEY

# Test database connection
def test_database_connection() -> Dict[str, Any]:
    """Test database connection and return status"""
    if is_using_fallback():
        return {
            "status": "fallback",
            "message": "Using fallback in-memory database",
            "supabase_configured": bool(SUPABASE_URL and SUPABASE_KEY)
        }
    else:
        try:
            # Try a simple query to test connection
            response = supabase_client.table('tasks').select('id').limit(1).execute()
            return {
                "status": "connected",
                "message": "Successfully connected to Supabase",
                "supabase_configured": True
            }
    except Exception as e:
            return {
                "status": "error",
                "message": f"Supabase connection failed: {str(e)}",
                "supabase_configured": True
            }