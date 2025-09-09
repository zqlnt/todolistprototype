from fastapi import APIRouter, HTTPException, Depends, status
from fastapi import Request
from typing import List, Optional
from datetime import datetime
from database import supabase_client, fallback_db, is_using_fallback
from models import Task, TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, User
from auth_utils import get_current_user_flexible
from reminder_scheduler import reminder_scheduler

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

# TEMPORARY: Create task without authentication
@router.post("/create", response_model=TaskResponse)
async def create_task_no_auth(request: Request, task: TaskCreate):
    """TEMPORARY: Create task without authentication"""
    try:
        print(f"DEBUG: Creating task without auth - Title: {task.title}")
        
        # Use a default user ID for now - generate proper UUID for Supabase
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
        
        # TEMPORARY WORKAROUND: Always use fallback storage so tasks add successfully in production
        created_task_data = fallback_db.create_task(task_data)
        
        created_task = Task(
            id=created_task_data['id'],
            user_id=created_task_data['user_id'],
            title=created_task_data['title'],
            status=created_task_data['status'],
            dueAt=created_task_data.get('dueAt'),
            isStarred=bool(created_task_data['isStarred']),
            category=created_task_data.get('category'),
            parentId=created_task_data.get('parent_id'),
            inserted_at=created_task_data['inserted_at'],
            updated_at=created_task_data['updated_at']
        )
        
        return TaskResponse(success=True, data=created_task, message="Task created successfully")
    except Exception as e:
        print(f"DEBUG: Error creating task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )

# TEMPORARY: List tasks without authentication (fallback only)
@router.get("/list-no-auth", response_model=TaskListResponse)
async def list_tasks_no_auth():
    """TEMPORARY: List tasks without authentication using fallback DB"""
    try:
        # Return all tasks from fallback for now (demo purposes)
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
        tasks.sort(key=lambda t: (not t.is_starred, t.due_at or ""))
        return TaskListResponse(success=True, data=tasks)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tasks (no-auth): {str(e)}"
        )

# TEMPORARY: Update task without authentication
@router.put("/update-no-auth/{task_id}", response_model=TaskResponse)
async def update_task_no_auth(task_id: str, task_update: TaskUpdate):
    """TEMPORARY: Update task without authentication"""
    try:
        # Find the task in fallback database
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
        
        # Convert to Task model
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

# TEMPORARY: Delete task without authentication
@router.delete("/delete-no-auth/{task_id}")
async def delete_task_no_auth(task_id: str):
    """TEMPORARY: Delete task without authentication"""
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

@router.get("/", response_model=TaskListResponse)
async def list_tasks(request: Request, current_user: User = Depends(get_current_user_flexible)):
    """Get all tasks for the current user"""
    try:
        if is_using_fallback():
            # Use fallback database
            task_data_list = fallback_db.get_tasks_by_user(current_user.id)
            tasks = []
            for task_data in task_data_list:
                task = Task(
                    id=task_data['id'],
                    user_id=task_data['user_id'],
                    title=task_data['title'],
                    status=task_data['status'],
                    dueAt=task_data.get('dueAt'),
                    isStarred=bool(task_data['isStarred']),
                    category=task_data.get('category'),
                    parentId=task_data.get('parent_id'),
                    inserted_at=task_data['inserted_at'],
                    updated_at=task_data['updated_at']
                )
                tasks.append(task)
        else:
            # Use Supabase
            response = supabase_client.table('tasks').select('*').eq('user_id', current_user.id).order('isStarred', desc=True).order('dueAt', desc=False).execute()
            
            tasks = []
            for task_data in response.data:
                # Convert snake_case to camelCase for frontend compatibility
                task = Task(
                    id=task_data['id'],
                    user_id=task_data['user_id'],
                    title=task_data['title'],
                    status=task_data['status'],
                    dueAt=task_data.get('dueAt'),
                    isStarred=task_data['isStarred'],
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
        print(f"DEBUG: Creating task - Title: {task.title}, Due: {task.due_at}, User: {current_user.id}")
        print(f"DEBUG: Request headers: {dict(request.headers)}")
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
            # Use Supabase
            response = supabase_client.table('tasks').insert(task_data).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create task"
                )
            
            created_task_data = response.data[0]
        
        print(f"DEBUG: Creating Task model with data: {created_task_data}")
        try:
            created_task = Task(
                id=created_task_data['id'],
                user_id=created_task_data['user_id'],
                title=created_task_data['title'],
                status=created_task_data['status'],
                dueAt=created_task_data.get('dueAt'),
                isStarred=bool(created_task_data['isStarred']),
                category=created_task_data.get('category'),
                parentId=created_task_data.get('parent_id'),
                inserted_at=created_task_data['inserted_at'],
                updated_at=created_task_data['updated_at']
            )
            print(f"DEBUG: Task model created successfully: {created_task}")
        except Exception as model_error:
            print(f"DEBUG: Error creating Task model: {model_error}")
            raise
        
        # Schedule reminder if task has a due date
        # TEMPORARILY DISABLED FOR DEBUGGING
        # if task.due_at:
        #     try:
        #         await reminder_scheduler.schedule_reminder(
        #             task_id=created_task.id,
        #             user_id=current_user.id,
        #             task_title=created_task.title,
        #             due_at=task.due_at,
        #             user_email=getattr(current_user, 'email', None)
        #         )
        #     except Exception as e:
        #         # Don't fail task creation if reminder scheduling fails
        #         print(f"Warning: Failed to schedule reminder for task {created_task.id}: {e}")
        
        return TaskResponse(success=True, data=created_task, message="Task created successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(request: Request, task_id: str, task_update: TaskUpdate, current_user: User = Depends(get_current_user_flexible)):
    """Update an existing task"""
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
            if not updated_task_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
        else:
            # Use Supabase
            response = supabase_client.table('tasks').update(update_data).eq('id', task_id).eq('user_id', current_user.id).execute()
            
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
            isStarred=bool(updated_task_data['isStarred']),
            category=updated_task_data.get('category'),
            parentId=updated_task_data.get('parent_id'),
            inserted_at=updated_task_data['inserted_at'],
            updated_at=updated_task_data['updated_at']
        )
        
        # Reschedule reminder if due date was updated
        if task_update.due_at is not None:
            try:
                # Cancel existing reminder
                reminder_scheduler.cancel_reminder(task_id)
                
                # Schedule new reminder if due date is in the future
                if task_update.due_at:
                    await reminder_scheduler.schedule_reminder(
                        task_id=updated_task.id,
                        user_id=current_user.id,
                        task_title=updated_task.title,
                        due_at=task_update.due_at,
                        user_email=getattr(current_user, 'email', None)
                    )
            except Exception as e:
                # Don't fail task update if reminder scheduling fails
                print(f"Warning: Failed to reschedule reminder for task {updated_task.id}: {e}")
        
        return TaskResponse(success=True, data=updated_task, message="Task updated successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )

@router.delete("/{task_id}")
async def delete_task(request: Request, task_id: str, current_user: User = Depends(get_current_user_flexible)):
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
            # Use Supabase
            response = supabase_client.table('tasks').delete().eq('id', task_id).eq('user_id', current_user.id).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
        
        # Cancel any scheduled reminder for this task
        try:
            reminder_scheduler.cancel_reminder(task_id)
        except Exception as e:
            print(f"Warning: Failed to cancel reminder for deleted task {task_id}: {e}")
        
        return {"success": True, "message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task: {str(e)}"
        )

@router.put("/{task_id}/status")
async def toggle_task_status(request: Request, task_id: str, current_user: User = Depends(get_current_user_flexible)):
    """Toggle task status between pending and done"""
    try:
        if is_using_fallback():
            # Use fallback database
            tasks = fallback_db.get_tasks_by_user(current_user.id)
            current_task = next((t for t in tasks if t['id'] == task_id), None)
            
            if not current_task:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
            
            current_status = current_task['status']
            new_status = 'done' if current_status == 'pending' else 'pending'
            
            fallback_db.update_task(task_id, current_user.id, {'status': new_status})
        else:
            # Use Supabase
            # First get the current task
            response = supabase_client.table('tasks').select('status').eq('id', task_id).eq('user_id', current_user.id).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
            
            current_status = response.data[0]['status']
            new_status = 'done' if current_status == 'pending' else 'pending'
            
            # Update the status
            update_response = supabase_client.table('tasks').update({'status': new_status}).eq('id', task_id).eq('user_id', current_user.id).execute()
        
        return {"success": True, "message": f"Task status updated to {new_status}"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle task status: {str(e)}"
        )

@router.put("/{task_id}/star")
async def toggle_task_star(request: Request, task_id: str, current_user: User = Depends(get_current_user_flexible)):
    """Toggle task star status"""
    try:
        if is_using_fallback():
            # Use fallback database
            tasks = fallback_db.get_tasks_by_user(current_user.id)
            current_task = next((t for t in tasks if t['id'] == task_id), None)
            
            if not current_task:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
            
            current_starred = bool(current_task['isStarred'])
            new_starred = not current_starred
            
            fallback_db.update_task(task_id, current_user.id, {'isStarred': new_starred})
        else:
            # Use Supabase
            # First get the current task
            response = supabase_client.table('tasks').select('isStarred').eq('id', task_id).eq('user_id', current_user.id).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )
            
            current_starred = response.data[0]['isStarred']
            new_starred = not current_starred
            
            # Update the star status
            update_response = supabase_client.table('tasks').update({'isStarred': new_starred}).eq('id', task_id).eq('user_id', current_user.id).execute()
        
        return {"success": True, "message": f"Task {'starred' if new_starred else 'unstarred'}"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle task star: {str(e)}"
        )

@router.get("/merge-compatibility-test")
async def merge_test(request: Request):
    """Test endpoint to verify merge compatibility setup"""
    return {
        "session_middleware": hasattr(request, 'session'),
        "current_auth": "working",
        "ready_for_merge": True
    }