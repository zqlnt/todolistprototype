from fastapi import APIRouter, HTTPException, Depends, status
from fastapi import Request
from typing import List, Optional
from datetime import datetime
from database import supabase_client, fallback_db, is_using_fallback, get_supabase_with_auth
from models import Task, TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, User
from auth_utils import get_current_user_flexible
from reminder_scheduler import reminder_scheduler

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/", response_model=TaskListResponse)
async def list_tasks(request: Request, current_user: User = Depends(get_current_user_flexible)):
    """Get all tasks for the current user"""
    try:
        if is_using_fallback():
            # Use fallback database
            task_data_list = fallback_db.get_tasks_by_user(current_user.id)
        else:
            # Use Supabase with user's JWT token
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
            
            access_token = auth_header.split(" ")[1]
            user_supabase = get_supabase_with_auth(access_token)
            if not user_supabase:
                raise HTTPException(status_code=500, detail="Failed to create authenticated Supabase client")
            
            response = user_supabase.table('tasks').select('*').eq('user_id', current_user.id).execute()
            task_data_list = response.data
        
        tasks: List[Task] = []
        for task_data in task_data_list:
            task = Task(
                id=task_data['id'],
                user_id=task_data['user_id'],
                title=task_data['title'],
                status=task_data['status'],
                dueAt=task_data.get('dueAt'),
                isStarred=bool(task_data.get('isStarred', False)),
                category=task_data.get('category'),
                parentId=task_data.get('parent_id'),
                inserted_at=task_data['inserted_at'],
                updated_at=task_data['updated_at']
            )
            tasks.append(task)
        
        return TaskListResponse(success=True, data=tasks)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tasks: {str(e)}"
        )

@router.post("/", response_model=TaskResponse)
async def create_task(request: Request, task: TaskCreate, current_user: User = Depends(get_current_user_flexible)):
    """Create a new task"""
    try:
        task_data = {
            'user_id': current_user.id,
            'title': task.title,
            'status': 'pending',
            'dueAt': task.due_at.isoformat() if task.due_at else None,
            'isStarred': task.is_starred,
            'category': task.category,
            'parent_id': task.parent_id
        }
        
        if is_using_fallback():
            # Use fallback database
            created_task_data = fallback_db.create_task(task_data)
        else:
            # Use Supabase with user's JWT token
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
            
            access_token = auth_header.split(" ")[1]
            user_supabase = get_supabase_with_auth(access_token)
            if not user_supabase:
                raise HTTPException(status_code=500, detail="Failed to create authenticated Supabase client")
            
            response = user_supabase.table('tasks').insert(task_data).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create task"
                )
            
            created_task_data = response.data[0]
        
        created_task = Task(
            id=created_task_data['id'],
            user_id=created_task_data['user_id'],
            title=created_task_data['title'],
            status=created_task_data['status'],
            dueAt=created_task_data.get('dueAt'),
            isStarred=bool(created_task_data.get('isStarred', False)),
            category=created_task_data.get('category'),
            parentId=created_task_data.get('parent_id'),
            inserted_at=created_task_data['inserted_at'],
            updated_at=created_task_data['updated_at']
        )
        
        # Schedule reminder if due date is set
        if task.due_at:
            user_email = getattr(current_user, 'email', None)
            await reminder_scheduler.schedule_reminder(
                created_task.id, 
                current_user.id, 
                task.title, 
                task.due_at, 
                user_email or 'user@example.com'
            )
        
        return TaskResponse(success=True, data=created_task, message="Task created successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_update: TaskUpdate, current_user: User = Depends(get_current_user_flexible)):
    """Update a task"""
    try:
        # Build update data
        update_data = {}
        if task_update.title is not None:
            update_data['title'] = task_update.title
        if task_update.status is not None:
            update_data['status'] = task_update.status
        if task_update.due_at is not None:
            update_data['dueAt'] = task_update.due_at.isoformat()
        if task_update.is_starred is not None:
            update_data['isStarred'] = task_update.is_starred
        if task_update.category is not None:
            update_data['category'] = task_update.category
        
        if is_using_fallback():
            # Use fallback database
            updated_task_data = fallback_db.update_task(task_id, current_user.id, update_data)
            if updated_task_data is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
        else:
            # Use Supabase with user's JWT token
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
            
            access_token = auth_header.split(" ")[1]
            user_supabase = get_supabase_with_auth(access_token)
            if not user_supabase:
                raise HTTPException(status_code=500, detail="Failed to create authenticated Supabase client")
            
            response = user_supabase.table('tasks').update(update_data).eq('id', task_id).eq('user_id', current_user.id).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
            
            updated_task_data = response.data[0]
        
        updated_task = Task(
            id=updated_task_data['id'],
            user_id=updated_task_data['user_id'],
            title=updated_task_data['title'],
            status=updated_task_data['status'],
            dueAt=updated_task_data.get('dueAt'),
            isStarred=bool(updated_task_data.get('isStarred', False)),
            category=updated_task_data.get('category'),
            parentId=updated_task_data.get('parent_id'),
            inserted_at=updated_task_data['inserted_at'],
            updated_at=updated_task_data['updated_at']
        )
        
        # Update reminder if due date changed
        if task_update.due_at:
            user_email = getattr(current_user, 'email', None)
            await reminder_scheduler.schedule_reminder(
                task_id, 
                current_user.id, 
                updated_task.title, 
                task_update.due_at, 
                user_email or 'user@example.com'
            )
        
        return TaskResponse(success=True, data=updated_task, message="Task updated successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )

@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user: User = Depends(get_current_user_flexible)):
    """Delete a task"""
    try:
        if is_using_fallback():
            # Use fallback database
            success = fallback_db.delete_task(task_id, current_user.id)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
        else:
            # Use Supabase with user's JWT token
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
            
            access_token = auth_header.split(" ")[1]
            user_supabase = get_supabase_with_auth(access_token)
            if not user_supabase:
                raise HTTPException(status_code=500, detail="Failed to create authenticated Supabase client")
            
            response = user_supabase.table('tasks').delete().eq('id', task_id).eq('user_id', current_user.id).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
        
        # Cancel any scheduled reminder
        reminder_scheduler.cancel_reminder(task_id)
        
        return {"success": True, "message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task: {str(e)}"
        )

@router.put("/{task_id}/status")
async def update_task_status(task_id: str, status_update: dict, current_user: User = Depends(get_current_user_flexible)):
    """Update task status (pending/done)"""
    try:
        new_status = status_update.get('status')
        if new_status not in ['pending', 'done']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status must be 'pending' or 'done'"
            )
        
        if is_using_fallback():
            # Use fallback database
            updated_task_data = fallback_db.update_task(task_id, current_user.id, {'status': new_status})
            if updated_task_data is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
        else:
            # Use Supabase with user's JWT token
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
            
            access_token = auth_header.split(" ")[1]
            user_supabase = get_supabase_with_auth(access_token)
            if not user_supabase:
                raise HTTPException(status_code=500, detail="Failed to create authenticated Supabase client")
            
            response = user_supabase.table('tasks').update({'status': new_status}).eq('id', task_id).eq('user_id', current_user.id).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
        
        return {"success": True, "message": f"Task status updated to {new_status}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task status: {str(e)}"
        )

@router.put("/{task_id}/star")
async def toggle_task_star(task_id: str, star_update: dict, current_user: User = Depends(get_current_user_flexible)):
    """Toggle task star status"""
    try:
        is_starred = star_update.get('isStarred', False)
        
        if is_using_fallback():
            # Use fallback database
            updated_task_data = fallback_db.update_task(task_id, current_user.id, {'isStarred': is_starred})
            if updated_task_data is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
        else:
            # Use Supabase with user's JWT token
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
            
            access_token = auth_header.split(" ")[1]
            user_supabase = get_supabase_with_auth(access_token)
            if not user_supabase:
                raise HTTPException(status_code=500, detail="Failed to create authenticated Supabase client")
            
            response = user_supabase.table('tasks').update({'isStarred': is_starred}).eq('id', task_id).eq('user_id', current_user.id).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
        
        return {"success": True, "message": f"Task {'starred' if is_starred else 'unstarred'}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task star: {str(e)}"
        )

# PRESENTATION WORKAROUND: Fallback endpoints that always work
@router.get("/fallback/list", response_model=TaskListResponse)
async def list_tasks_fallback():
    """Fallback endpoint that always works - returns all tasks from fallback DB"""
    try:
        tasks: List[Task] = []
        for task_data in fallback_db.tasks.values():
            task = Task(
                id=task_data['id'],
                user_id=task_data['user_id'],
                title=task_data['title'],
                status=task_data['status'],
                dueAt=task_data.get('dueAt'),
                isStarred=bool(task_data.get('isStarred', False)),
                category=task_data.get('category'),
                parentId=task_data.get('parent_id'),
                inserted_at=task_data['inserted_at'],
                updated_at=task_data['updated_at']
            )
            tasks.append(task)
        # Sort: starred first then due date ascending
        tasks.sort(key=lambda t: (not t.isStarred, t.dueAt or ""))
        return TaskListResponse(success=True, data=tasks)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tasks: {str(e)}"
        )

@router.post("/fallback/create", response_model=TaskResponse)
async def create_task_fallback(task: TaskCreate):
    """Fallback endpoint that always works - creates task in fallback DB"""
    try:
        import uuid
        user_id = str(uuid.uuid4())
        
        task_data = {
            'user_id': user_id,
            'title': task.title,
            'status': 'pending',
            'dueAt': task.due_at.isoformat() if task.due_at else None,
            'isStarred': task.is_starred,
            'category': task.category,
            'parent_id': task.parent_id
        }
        
        created_task_data = fallback_db.create_task(task_data)
        
        created_task = Task(
            id=created_task_data['id'],
            user_id=created_task_data['user_id'],
            title=created_task_data['title'],
            status=created_task_data['status'],
            dueAt=created_task_data.get('dueAt'),
            isStarred=bool(created_task_data.get('isStarred', False)),
            category=created_task_data.get('category'),
            parentId=created_task_data.get('parent_id'),
            inserted_at=created_task_data['inserted_at'],
            updated_at=created_task_data['updated_at']
        )
        
        return TaskResponse(success=True, data=created_task, message="Task created successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )

@router.put("/fallback/update/{task_id}", response_model=TaskResponse)
async def update_task_fallback(task_id: str, task_update: TaskUpdate):
    """Fallback endpoint that always works - updates task in fallback DB"""
    try:
        if task_id not in fallback_db.tasks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        task = fallback_db.tasks[task_id]
        
        # Build update data
        update_data = {}
        if task_update.title is not None:
            update_data['title'] = task_update.title
        if task_update.status is not None:
            update_data['status'] = task_update.status
        if task_update.due_at is not None:
            update_data['dueAt'] = task_update.due_at.isoformat()
        if task_update.is_starred is not None:
            update_data['isStarred'] = task_update.is_starred
        if task_update.category is not None:
            update_data['category'] = task_update.category
        
        # Update the task
        for key, value in update_data.items():
            if key in task:
                task[key] = value
        
        task['updated_at'] = datetime.now().isoformat()
        
        updated_task = Task(
            id=task['id'],
            user_id=task['user_id'],
            title=task['title'],
            status=task['status'],
            dueAt=task.get('dueAt'),
            isStarred=bool(task.get('isStarred', False)),
            category=task.get('category'),
            parentId=task.get('parent_id'),
            inserted_at=task['inserted_at'],
            updated_at=task['updated_at']
        )
        
        return TaskResponse(success=True, data=updated_task, message="Task updated successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )

@router.delete("/fallback/delete/{task_id}")
async def delete_task_fallback(task_id: str):
    """Fallback endpoint that always works - deletes task from fallback DB"""
    try:
        if task_id not in fallback_db.tasks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        del fallback_db.tasks[task_id]
        return {"success": True, "message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task: {str(e)}"
        )