from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal, Union
from datetime import datetime
from uuid import UUID

# User models
class User(BaseModel):
    id: str
    email: str
    created_at: Union[str, datetime]
    
    @field_validator('created_at', mode='before')
    @classmethod
    def parse_created_at(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    theme: Literal['light', 'dark'] = 'light'
    default_start_page: str = 'dashboard'
    week_start: Literal['monday', 'sunday'] = 'monday'

# Task models
class TaskBase(BaseModel):
    title: str
    due_at: Optional[datetime] = Field(None, alias="dueAt")
    is_starred: bool = Field(False, alias="isStarred")
    category: Optional[str] = None
    parent_id: Optional[str] = Field(None, alias="parentId")
    
    @field_validator('due_at', mode='before')
    @classmethod
    def parse_due_at(cls, v):
        if v is None or v == '':
            return None
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                # Try parsing as ISO format
                try:
                    return datetime.fromisoformat(v)
                except ValueError:
                    return None
        return v

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[Literal['pending', 'done']] = None
    due_at: Optional[datetime] = Field(None, alias="dueAt")
    is_starred: Optional[bool] = Field(None, alias="isStarred")
    category: Optional[str] = None
    
    @field_validator('due_at', mode='before')
    @classmethod
    def parse_due_at(cls, v):
        if v is None or v == '':
            return None
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                # Try parsing as ISO format
                try:
                    return datetime.fromisoformat(v)
                except ValueError:
                    return None
        return v

class Task(TaskBase):
    id: str
    user_id: str
    status: Literal['pending', 'done']
    inserted_at: datetime
    updated_at: datetime
    
    class Config:
        allow_population_by_field_name = True

# Email models
class Email(BaseModel):
    id: str
    subject: str
    body: str
    received_at: datetime
    sender: Optional[str] = None
    recipient: Optional[str] = None

class SuggestedTask(BaseModel):
    id: str
    title: str
    due_at: Optional[datetime] = Field(None, alias="dueAt")
    category: Optional[str] = None
    linked_email_id: Optional[str] = Field(None, alias="linkedEmailId")
    email_subject: Optional[str] = Field(None, alias="emailSubject")

# Category models
class CategoryBase(BaseModel):
    name: str
    color: str = '#3B82F6'

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class Category(CategoryBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        allow_population_by_field_name = True

# Response models
class TaskResponse(BaseModel):
    success: bool
    data: Optional[Task] = None
    message: Optional[str] = None

class TaskListResponse(BaseModel):
    success: bool
    data: list[Task] = []
    message: Optional[str] = None

class EmailSyncResponse(BaseModel):
    success: bool
    emails: list[Email] = []
    suggestions: list[SuggestedTask] = []
    message: Optional[str] = None

class CategoryResponse(BaseModel):
    success: bool
    data: Optional[Category] = None
    message: Optional[str] = None

class CategoryListResponse(BaseModel):
    success: bool
    data: list[Category] = []
    message: Optional[str] = None