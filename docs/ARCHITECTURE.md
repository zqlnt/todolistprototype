# Sentinel Architecture Documentation

## System Overview

Sentinel is a full-stack productivity application that uses a modern three-tier architecture combining a React frontend, Python FastAPI backend, and Supabase database. This architecture provides enhanced security, scalability, and maintainability compared to direct frontend-to-database connections.

## Architecture Overview

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐    Supabase Client    ┌─────────────────┐
│                 │ ──────────────────► │                 │ ────────────────────► │                 │
│  React Frontend │                     │ FastAPI Backend │                       │ Supabase Cloud  │
│   (Port 5173)   │ ◄────────────────── │   (Port 8000)   │ ◄──────────────────── │   (Database)    │
└─────────────────┘    JSON Responses   └─────────────────┘    Database Results   └─────────────────┘
```

## Frontend Architecture (React + TypeScript)

### Component Hierarchy

```
App
├── Auth (when unauthenticated)
└── Main Layout (when authenticated)
    ├── Sidebar
    │   ├── Navigation
    │   ├── Category Management
    │   └── User Profile
    ├── Header
    │   ├── Page Title
    │   ├── Search Bar
    │   └── View Controls
    ├── Main Content
    │   ├── Dashboard
    │   ├── TodoList
    │   │   └── TodoCard
    │   │       └── TaskItem (recursive)
    │   ├── Calendar
    │   ├── Inbox
    │   ├── SentinelAI
    │   ├── Contacts
    │   ├── Chats
    │   ├── Notifications
    │   └── Connections
    └── BottomNav (mobile only)
```

### Data Flow

```
User Action → Component → Store Action → API Service → FastAPI Backend → Supabase → Response Chain
```

### State Management (Zustand)

```typescript
interface TodoState {
  // Data (from backend API)
  tasks: Task[]
  emails: Email[]
  contacts: Contact[]
  
  // UI State (local only)
  currentPage: AppPage
  isLoading: boolean
  sectionFilter: TaskSection
  
  // Authentication (managed by FastAPI)
  session: Session | null
  authStatus: AuthStatus
  
  // Actions (API calls to FastAPI)
  addTask: (title, dueAt?, category?, parentId?) => Promise<void>
  toggleDone: (taskId) => Promise<void>
  signIn: (email, password) => Promise<void>
}
```

## Backend Architecture (FastAPI + Python)

### API Layer Structure

```
backend/
├── main.py              # FastAPI app setup, middleware, CORS
├── database.py          # Supabase client configuration
├── models.py            # Pydantic data models
├── routers/
│   ├── auth.py         # Authentication endpoints
│   ├── tasks.py        # Task CRUD operations
│   └── emails.py       # Email sync and suggestions
├── requirements.txt     # Python dependencies
└── run.py              # Development server runner
```

### Request/Response Flow

1. **Client Request**: React frontend sends HTTP request to FastAPI
2. **Authentication**: FastAPI validates JWT token from request headers
3. **Data Validation**: Pydantic models validate request data
4. **Business Logic**: FastAPI processes the request
5. **Database Operation**: FastAPI communicates with Supabase
6. **Response**: Structured JSON response sent back to frontend

### API Endpoints

#### Authentication Routes (`/api/auth/`)
```python
POST /signin     # User authentication
POST /signup     # User registration  
POST /signout    # Session termination
GET  /user       # Get user profile
```

#### Task Routes (`/api/tasks/`)
```python
GET    /              # List all user tasks
POST   /              # Create new task
PUT    /{task_id}     # Update task
DELETE /{task_id}     # Delete task
PUT    /{task_id}/status  # Toggle completion
PUT    /{task_id}/star    # Toggle priority
```

#### Email Routes (`/api/emails/`)
```python
GET  /              # Get user emails
POST /sync          # Sync emails and generate suggestions
GET  /suggestions   # Get task suggestions from emails
```

### Data Models (Pydantic)

```python
class TaskBase(BaseModel):
    title: str
    due_at: Optional[datetime] = Field(None, alias="dueAt")
    is_starred: bool = Field(False, alias="isStarred")
    category: Optional[str] = None
    parent_id: Optional[str] = Field(None, alias="parentId")

class Task(TaskBase):
    id: str
    user_id: str
    status: Literal['pending', 'done']
    inserted_at: datetime
    updated_at: datetime
```

## Database Architecture (Supabase)

### Schema Design

```sql
-- Users table (managed by Supabase Auth)
auth.users (
  id uuid PRIMARY KEY,
  email text,
  created_at timestamptz,
  -- ... other auth fields
)

-- Tasks table
public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text DEFAULT 'pending',
  dueAt timestamptz,
  isStarred boolean DEFAULT false,
  category text,
  parent_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  inserted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### Row Level Security (RLS)

```sql
-- Users can only access their own tasks
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Indexes for Performance

```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_at ON tasks(dueAt);
```

## Security Architecture

### Authentication Flow

1. **User Login**: Frontend sends credentials to FastAPI `/api/auth/signin`
2. **Supabase Auth**: FastAPI validates credentials with Supabase Auth
3. **JWT Token**: Supabase returns JWT access token
4. **Token Storage**: Frontend stores token and includes in future requests
5. **Request Validation**: FastAPI validates JWT on each protected endpoint

### Authorization Layers

1. **FastAPI Middleware**: Validates JWT tokens on protected routes
2. **Supabase RLS**: Database-level access control
3. **User Isolation**: All data queries filtered by authenticated user ID

### Data Protection

- **Input Validation**: Pydantic models validate all request data
- **SQL Injection Prevention**: Supabase client uses parameterized queries
- **XSS Protection**: React's built-in escaping + API validation
- **CORS Configuration**: Controlled cross-origin access

## Performance Architecture

### Backend Performance

```python
# Async FastAPI for high concurrency
@router.get("/tasks/")
async def list_tasks(current_user: User = Depends(get_current_user)):
    # Non-blocking database operations
    response = await supabase_client.table('tasks').select('*').execute()
```

### Database Performance

- **Connection Pooling**: Supabase manages connection pools
- **Indexed Queries**: Fast lookups on user_id, parent_id, status
- **Query Optimization**: Efficient SQL with proper joins and filters

### Frontend Performance

- **API Service Layer**: Centralized HTTP client with error handling
- **State Management**: Zustand's efficient re-render system
- **Component Optimization**: React.memo for expensive components
- **Bundle Optimization**: Vite's tree-shaking and code splitting

## Scalability Architecture

### Horizontal Scaling

**Frontend**: 
- Static hosting (Vercel, Netlify)
- CDN distribution
- Multiple deployment regions

**Backend**:
- Multiple FastAPI instances behind load balancer
- Stateless design enables easy scaling
- Container deployment (Docker)

**Database**:
- Supabase handles automatic scaling
- Read replicas for improved performance
- Connection pooling and query optimization

### Vertical Scaling

- **CPU**: FastAPI's async nature maximizes CPU utilization
- **Memory**: Efficient Python memory management
- **I/O**: Non-blocking database operations

## Development Architecture

### Local Development Setup

```bash
# Terminal 1: FastAPI Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py  # Runs on http://localhost:8000

# Terminal 2: React Frontend  
npm install
npm run dev    # Runs on http://localhost:5173
```

### API Development Workflow

1. **Define Pydantic Models**: Data validation and serialization
2. **Create Router**: Endpoint logic in `routers/` directory
3. **Add Database Operations**: Supabase client calls
4. **Test with Swagger**: Auto-generated API documentation
5. **Update Frontend**: API service and store integration

### Code Organization Principles

**Backend**:
- **Single Responsibility**: Each router handles one domain
- **Dependency Injection**: FastAPI's dependency system
- **Error Handling**: Consistent HTTP status codes and messages
- **Type Safety**: Full type hints with Pydantic

**Frontend**:
- **Component Modularity**: Single-purpose components
- **Service Layer**: Abstracted API communication
- **State Management**: Centralized with Zustand
- **Type Safety**: TypeScript strict mode

## Deployment Architecture

### Production Deployment

**Frontend (Static Hosting)**:
```bash
npm run build  # Creates optimized static files
# Deploy to Vercel, Netlify, or similar
```

**Backend (Cloud Hosting)**:
```bash
# Railway, Render, or similar
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

**Database (Supabase Cloud)**:
- Managed PostgreSQL with automatic backups
- Global CDN for static assets
- Built-in monitoring and analytics

### Environment Configuration

**Development**:
```env
# Backend
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=dev_key
DEBUG=True

# Frontend  
VITE_API_BASE_URL=http://localhost:8000/api
VITE_SUPABASE_URL=http://localhost:54321
```

**Production**:
```env
# Backend
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod_service_key
DEBUG=False

# Frontend
VITE_API_BASE_URL=https://your-api.railway.app/api
VITE_SUPABASE_URL=https://your-project.supabase.co
```

## Monitoring and Observability

### Application Monitoring

**FastAPI Built-in**:
- Automatic OpenAPI documentation
- Request/response logging
- Performance metrics

**Custom Monitoring**:
```python
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### Error Tracking

```python
# Structured error logging
import logging

logger = logging.getLogger(__name__)

@router.post("/tasks/")
async def create_task(task: TaskCreate, current_user: User = Depends(get_current_user)):
    try:
        # Task creation logic
        pass
    except Exception as e:
        logger.error(f"Task creation failed for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

## Future Architecture Considerations

### Microservices Evolution

Current monolithic FastAPI backend could be split into:
- **Auth Service**: User management and authentication
- **Task Service**: Task CRUD and business logic  
- **Email Service**: Email sync and AI suggestions
- **Notification Service**: Real-time notifications

### Caching Layer

```python
# Redis integration for improved performance
import redis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

@app.on_event("startup")
async def startup():
    redis_client = redis.from_url("redis://localhost:6379")
    FastAPICache.init(RedisBackend(redis_client), prefix="sentinel-cache")
```

### Real-time Features

```python
# WebSocket support for live updates
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # Real-time task updates
```

### AI Integration

```python
# LLM integration for Sentinel AI
from openai import AsyncOpenAI

@router.post("/ai/chat")
async def chat_with_ai(message: str, current_user: User = Depends(get_current_user)):
    client = AsyncOpenAI()
    response = await client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": message}]
    )
    return {"response": response.choices[0].message.content}
```

This architecture provides a solid foundation for a scalable, maintainable, and secure productivity application while remaining flexible for future enhancements and integrations.