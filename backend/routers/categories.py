"""
Categories router for managing user-specific categories
"""
from fastapi import APIRouter, Request, HTTPException, Depends, status
from models import Category, CategoryCreate, CategoryUpdate, CategoryResponse, CategoryListResponse, User
from auth_utils import get_current_user_flexible
from database import supabase_client, fallback_db, is_using_fallback
import uuid

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=CategoryListResponse)
async def list_categories(request: Request, current_user: User = Depends(get_current_user_flexible)):
    """Get all categories for the current user"""
    try:
        if is_using_fallback():
            # Use fallback database
            categories_data = fallback_db.get_categories_by_user(current_user.id)
        else:
            # Use Supabase
            from database import SUPABASE_URL, SUPABASE_KEY
            from supabase import create_client
            
            # Create Supabase client with service role key
            supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            response = supabase_client.table('categories').select('*').eq('user_id', current_user.id).execute()
            categories_data = response.data
        
        categories = [
            Category(
                id=cat['id'],
                user_id=cat['user_id'],
                name=cat['name'],
                color=cat.get('color', '#3B82F6'),
                created_at=cat['created_at'],
                updated_at=cat['updated_at']
            )
            for cat in categories_data
        ]
        
        return CategoryListResponse(success=True, data=categories, message="Categories retrieved successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch categories: {str(e)}"
        )

@router.post("/", response_model=CategoryResponse)
async def create_category(request: Request, category: CategoryCreate, current_user: User = Depends(get_current_user_flexible)):
    """Create a new category"""
    try:
        category_data = {
            'user_id': current_user.id,
            'name': category.name,
            'color': category.color
        }
        
        if is_using_fallback():
            # Use fallback database
            created_category_data = fallback_db.create_category(category_data)
        else:
            # Use Supabase
            from database import SUPABASE_URL, SUPABASE_KEY
            from supabase import create_client
            
            # Create Supabase client with service role key
            supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            response = supabase_client.table('categories').insert(category_data).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create category"
                )
            
            created_category_data = response.data[0]
        
        created_category = Category(
            id=created_category_data['id'],
            user_id=created_category_data['user_id'],
            name=created_category_data['name'],
            color=created_category_data.get('color', '#3B82F6'),
            created_at=created_category_data['created_at'],
            updated_at=created_category_data['updated_at']
        )
        
        return CategoryResponse(success=True, data=created_category, message="Category created successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create category: {str(e)}"
        )

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: str, category_update: CategoryUpdate, current_user: User = Depends(get_current_user_flexible)):
    """Update a category"""
    try:
        update_data = {}
        if category_update.name is not None:
            update_data['name'] = category_update.name
        if category_update.color is not None:
            update_data['color'] = category_update.color
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        if is_using_fallback():
            # Use fallback database
            updated_category_data = fallback_db.update_category(category_id, current_user.id, update_data)
            if not updated_category_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Category not found"
                )
        else:
            # Use Supabase
            from database import SUPABASE_URL, SUPABASE_KEY
            from supabase import create_client
            
            # Create Supabase client with service role key
            supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            response = supabase_client.table('categories').update(update_data).eq('id', category_id).eq('user_id', current_user.id).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Category not found"
                )
            
            updated_category_data = response.data[0]
        
        updated_category = Category(
            id=updated_category_data['id'],
            user_id=updated_category_data['user_id'],
            name=updated_category_data['name'],
            color=updated_category_data.get('color', '#3B82F6'),
            created_at=updated_category_data['created_at'],
            updated_at=updated_category_data['updated_at']
        )
        
        return CategoryResponse(success=True, data=updated_category, message="Category updated successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update category: {str(e)}"
        )

@router.delete("/{category_id}", response_model=CategoryResponse)
async def delete_category(category_id: str, current_user: User = Depends(get_current_user_flexible)):
    """Delete a category"""
    try:
        if is_using_fallback():
            # Use fallback database
            success = fallback_db.delete_category(category_id, current_user.id)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Category not found"
                )
        else:
            # Use Supabase
            from database import SUPABASE_URL, SUPABASE_KEY
            from supabase import create_client
            
            # Create Supabase client with service role key
            supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            response = supabase_client.table('categories').delete().eq('id', category_id).eq('user_id', current_user.id).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Category not found"
                )
        
        return CategoryResponse(success=True, data=None, message="Category deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete category: {str(e)}"
        )
