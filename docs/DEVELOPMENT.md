# Sentinel Development Guide

## Getting Started

### Prerequisites
- **Node.js 18+** for the React frontend
- **Python 3.8+** for the FastAPI backend
- **Supabase account** for database and authentication
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Installation

#### 1. Clone and Setup
```bash
git clone <repository-url>
cd sentinel
npm install
```

#### 2. Backend Setup (Required)
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

Edit `backend/.env` with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

#### 3. Frontend Setup
```bash
# Create frontend environment file (in project root)
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000/api
```

### Running the Application

**You need TWO terminal windows running simultaneously:**

#### Terminal 1 - Backend (FastAPI)
```bash
cd backend
source venv/bin/activate  # If using virtual environment
python run.py
```
✅ Backend running at `http://localhost:8000`
✅ API docs available at `http://localhost:8000/docs`

#### Terminal 2 - Frontend (React)
```bash
npm run dev
```
✅ Frontend running at `http://localhost:5173`

#### Alternative - Run Both Services
```bash
npm run dev:full
```
This runs both frontend and backend concurrently using the `concurrently` package.

## Development Workflow

### Backend Development (FastAPI)

#### Project Structure
```
backend/
├── main.py              # FastAPI app setup, middleware, CORS
├── auth_utils.py        # Hybrid authentication utilities
├── database.py          # Supabase client configuration
├── models.py            # Pydantic data models
├── routers/
│   ├── __init__.py     # Router package initialization
│   ├── auth.py         # Authentication endpoints
│   ├── tasks.py        # Task CRUD operations
│   └── emails.py       # Email sync and suggestions
├── requirements.txt     # Python dependencies
├── run.py              # Development server runner
└── .env.example        # Environment template
```

#### Merge Compatibility Features

The backend includes several features designed for seamless merging with other repositories:

**Session Middleware Support:**
```python
# Added to main.py
from starlette.middleware.sessions import SessionMiddleware

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv('SESSION_SECRET_KEY'),
    same_site='lax',
    https_only=False
)
```

**Hybrid Authentication:**
```python
# auth_utils.py - supports both JWT and session auth
async def get_current_user_flexible(request: Request, credentials: HTTPAuthorizationCredentials):
    # Try JWT first (current system)
    try:
        return validate_jwt_user(credentials)
    except:
        # Session fallback (for merge compatibility)
        session_data = request.session.get('credentials')
        if session_data:
            return create_user_from_session(session_data)
        raise HTTPException(401, "Authentication required")
```

**Router Structure Alignment:**
```python
# Routers now define their own prefixes
router = APIRouter(prefix="/api/tasks", tags=["tasks"])

# All routes accept Request objects
@router.get("/")
async def list_tasks(request: Request, current_user: User = Depends(get_current_user_flexible)):
    # Implementation
    pass
```

#### Adding New API Endpoints

1. **Define Pydantic Models** in `models.py`:
```python
class NewFeatureBase(BaseModel):
    name: str
    description: Optional[str] = None

class NewFeatureCreate(NewFeatureBase):
    pass

class NewFeature(NewFeatureBase):
    id: str
    user_id: str
    created_at: datetime
```

2. **Create Router** in `routers/new_feature.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from models import NewFeature, NewFeatureCreate
from auth_utils import get_current_user_flexible

router = APIRouter(prefix="/api/new-feature", tags=["new-feature"])

@router.get("/", response_model=List[NewFeature])
async def list_features(request: Request, current_user: User = Depends(get_current_user_flexible)):
    # Implementation here
    pass

@router.post("/", response_model=NewFeature)
async def create_feature(request: Request, feature: NewFeatureCreate, current_user: User = Depends(get_current_user_flexible)):
    # Implementation here
    pass
```

3. **Include Router** in `main.py`:
```python
from routers import new_feature

app.include_router(new_feature.router)
```

4. **Test with Swagger UI** at `http://localhost:8000/docs`

#### Merge Compatibility Testing

Test the merge compatibility setup:
```bash
# Test compatibility endpoint
curl http://localhost:8000/api/tasks/merge-compatibility-test

# Expected response:
{
  "session_middleware": true,
  "current_auth": "working",
  "ready_for_merge": true
}
```

#### Database Operations

All database operations use the Supabase client:

```python
from database import supabase_client

# Create
response = supabase_client.table('table_name').insert(data).execute()

# Read
response = supabase_client.table('table_name').select('*').eq('user_id', user_id).execute()

# Update
response = supabase_client.table('table_name').update(data).eq('id', item_id).execute()

# Delete
response = supabase_client.table('table_name').delete().eq('id', item_id).execute()
```

#### Error Handling Patterns

```python
@router.post("/tasks/")
async def create_task(request: Request, task: TaskCreate, current_user: User = Depends(get_current_user_flexible)):
    try:
        # Database operation
        response = supabase_client.table('tasks').insert(task_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create task"
            )
        
        return TaskResponse(success=True, data=response.data[0])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )
```

#### Authentication Middleware

```python
from auth_utils import get_current_user_flexible
from fastapi import Request, Depends

# Use the hybrid authentication function
@router.get("/protected-endpoint")
async def protected_route(request: Request, current_user: User = Depends(get_current_user_flexible)):
    # Route implementation
    pass
```

### Frontend Development (React + TypeScript)

#### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Header.tsx      # Page header
│   ├── TodoCard.tsx    # Task list container
│   ├── TaskItem.tsx    # Individual task component
│   └── BottomNav.tsx   # Mobile navigation
├── pages/              # Main application pages
│   ├── Dashboard.tsx   # Dashboard overview
│   ├── TodoList.tsx    # Task management
│   ├── Auth.tsx        # Authentication
│   └── ...
├── services/           # API service layer
│   ├── api.ts          # HTTP client
│   └── tasks.ts        # Task-specific operations
├── types.ts            # TypeScript type definitions
├── store.ts            # Zustand state management
├── rules.ts            # Business logic
└── main.tsx           # Application entry point
```

#### Data State
- `tasks[]` - All user tasks from database *(real backend integration)*
- `suggestedTasks[]` - AI-generated task suggestions *(from mock email data)*
- `emails[]` - Synced email data *(mock data from backend)*
- `contacts[]` - User contacts *(mock data in frontend)*
- `chats[]` - Chat conversations *(mock data in frontend)*
- `notifications[]` - System notifications *(mock data in frontend)*

#### UI State
- `currentPage` - Active page/view
- `sectionFilter` - Task filtering (Today, Tomorrow, etc.)
- `showPriorityOnly` - Priority filter toggle
- `viewMode` - List or grid view
- `taskGroupingMode` - Group by time or category

#### Authentication State
- `session` - Supabase session object *(real backend integration)*
- `user` - Current user data *(real backend integration)*
- `authStatus` - Loading/authenticated/unauthenticated
- `userProfile` - User preferences and profile data *(real backend integration)*

#### Adding New Features

1. **Define TypeScript Types** in `types.ts`:
```typescript
export interface NewFeature {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
}
```

2. **Add API Service Functions** in `services/`:
```typescript
// services/newFeature.ts
import { apiService } from './api';

export async function listFeatures() {
  try {
    const response = await apiService.request<NewFeature[]>('/new-feature/');
    return { data: response, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
}

export async function createFeature(feature: Omit<NewFeature, 'id' | 'user_id' | 'created_at'>) {
  try {
    const response = await apiService.request<NewFeature>('/new-feature/', {
      method: 'POST',
      body: JSON.stringify(feature)
    });
    return { data: response, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
}
```

3. **Update Zustand Store** in `store.ts`:
```typescript
interface TodoState {
  // Add new state
  features: NewFeature[];
  
  // Add new actions
  addFeature: (feature: Omit<NewFeature, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  fetchFeatures: () => Promise<void>;
}

// Add implementation
addFeature: async (feature) => {
  set({ isLoading: true });
  try {
    const { data, error } = await createFeature(feature);
    if (error) {
      set({ syncMessage: 'Error adding feature' });
    } else {
      set({ syncMessage: 'Feature added successfully!' });
      await get().fetchFeatures();
    }
  } catch (error) {
    set({ syncMessage: 'Error adding feature' });
  }
  set({ isLoading: false });
  setTimeout(() => set({ syncMessage: '' }), 3000);
}
```

4. **Create React Components**:
```typescript
// components/FeatureCard.tsx
import React from 'react';
import { NewFeature } from '../types';

interface FeatureCardProps {
  feature: NewFeature;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
      <h3 className="text-lg font-semibold text-neutral-900">{feature.name}</h3>
      {feature.description && (
        <p className="text-sm text-neutral-600 mt-2">{feature.description}</p>
      )}
    </div>
  );
};

export default FeatureCard;
```

#### Component Design Patterns

**Standard Component Template**:
```typescript
import React, { useState, useEffect } from 'react';
import { IconName } from 'lucide-react';
import { useTodoStore } from '../store';

interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
}

const ComponentName: React.FC<ComponentProps> = ({ 
  requiredProp, 
  optionalProp = defaultValue 
}) => {
  // 1. Hooks at the top
  const [localState, setLocalState] = useState('');
  const { storeData, storeAction } = useTodoStore();
  
  // 2. Event handlers
  const handleAction = async () => {
    try {
      await storeAction();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };
  
  // 3. Effects
  useEffect(() => {
    // Side effects here
  }, [dependencies]);
  
  // 4. Render
  return (
    <div className="component-container">
      {/* JSX here */}
    </div>
  );
};

export default ComponentName;
```

#### State Management Patterns

**Zustand Store Design**:
```typescript
interface TodoState {
  // Data (from backend)
  tasks: Task[];
  
  // UI State (local only)
  currentPage: AppPage;
  isLoading: boolean;
  
  // Actions (async operations)
  addTask: (title: string) => Promise<void>;
  
  // Computed values (derived state)
  get openTasks() {
    return this.tasks.filter(t => t.status === 'pending');
  }
}
```

**Async Action Pattern**:
```typescript
addTask: async (title: string) => {
  // 1. Set loading state
  set({ isLoading: true });
  
  try {
    // 2. Call API service
    const { data, error } = await createTask({ title });
    
    if (error) {
      // 3. Handle errors
      set({ syncMessage: 'Error adding task' });
    } else {
      // 4. Update success state
      set({ syncMessage: 'Task added!' });
      // 5. Refresh data from source of truth
      await get().fetchTasks();
    }
  } catch (error) {
    // 6. Handle unexpected errors
    set({ syncMessage: 'Unexpected error occurred' });
  }
  
  // 7. Clear loading state
  set({ isLoading: false });
  
  // 8. Clear messages after delay
  setTimeout(() => set({ syncMessage: '' }), 3000);
}
```

### Database Development

#### Migration Best Practices

**Create New Migration Files**:
```sql
-- supabase/migrations/add_new_feature_table.sql

/*
  # Add new feature table

  1. New Tables
    - `features`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `features` table
    - Add policy for users to manage own features
*/

CREATE TABLE IF NOT EXISTS features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own features"
  ON features
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_features_user_id ON features(user_id);
CREATE INDEX IF NOT EXISTS idx_features_created_at ON features(created_at);
```

**Safe Column Addition**:
```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'priority_score'
  ) THEN
    ALTER TABLE tasks ADD COLUMN priority_score integer DEFAULT 0;
  END IF;
END $$;
```

#### RLS Policy Patterns

**User Isolation**:
```sql
CREATE POLICY "Users can manage own data" ON table_name
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Read-only Shared Data**:
```sql
CREATE POLICY "Users can read shared data" ON shared_table
  FOR SELECT TO authenticated
  USING (is_public = true OR auth.uid() = user_id);
```

### Code Quality Standards

#### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### ESLint Configuration
```javascript
// eslint.config.js
export default tseslint.config({
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  rules: {
    'react-hooks/exhaustive-deps': 'error',
    'no-unused-vars': 'error',
    'prefer-const': 'error'
  }
});
```

#### Python Code Quality
```python
# Use type hints
def create_task(task_data: dict, user_id: str) -> dict:
    return {"id": "123", "title": task_data["title"]}

# Use Pydantic for validation
class TaskCreate(BaseModel):
    title: str
    due_at: Optional[datetime] = None
    
    class Config:
        alias_generator = to_camel
```

## Testing Strategy

### Backend Testing (Future Implementation)

#### Unit Testing with pytest
```python
# tests/test_tasks.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_task():
    response = client.post(
        "/api/tasks/",
        json={"title": "Test Task"},
        headers={"Authorization": "Bearer test_token"}
    )
    assert response.status_code == 200
    assert response.json()["data"]["title"] == "Test Task"
```

#### Integration Testing
```python
# tests/test_integration.py
def test_task_workflow():
    # Create task
    create_response = client.post("/api/tasks/", json={"title": "Test"})
    task_id = create_response.json()["data"]["id"]
    
    # Update task
    update_response = client.put(f"/api/tasks/{task_id}", json={"status": "done"})
    assert update_response.json()["data"]["status"] == "done"
    
    # Delete task
    delete_response = client.delete(f"/api/tasks/{task_id}")
    assert delete_response.status_code == 200
```

### Frontend Testing (Future Implementation)

#### Component Testing with React Testing Library
```typescript
// components/__tests__/TaskItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '../TaskItem';

describe('TaskItem', () => {
  it('should toggle task completion', async () => {
    const mockTask = { id: '1', title: 'Test', status: 'pending' };
    render(<TaskItem task={mockTask} />);
    
    const checkbox = screen.getByRole('button');
    fireEvent.click(checkbox);
    
    expect(mockToggleDone).toHaveBeenCalledWith('1');
  });
});
```

#### Store Testing
```typescript
// store/__tests__/store.test.ts
import { useTodoStore } from '../store';

describe('TodoStore', () => {
  it('should add task and update state', async () => {
    const store = useTodoStore.getState();
    await store.addTask('New Task');
    
    expect(store.tasks).toContainEqual(
      expect.objectContaining({ title: 'New Task' })
    );
  });
});
```

## Debugging Guide

### Common Issues

#### Backend Issues

**"Module not found" errors**:
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Database connection errors**:
```python
# Check environment variables
import os
print("SUPABASE_URL:", os.getenv("SUPABASE_URL"))
print("SUPABASE_SERVICE_ROLE_KEY:", os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

# Test connection
from database import supabase_client
response = supabase_client.table('tasks').select('count').execute()
print("Connection test:", response)
```

**Authentication errors**:
```python
# Debug JWT token validation
@router.get("/debug/auth")
async def debug_auth(current_user: User = Depends(get_current_user)):
    return {"user_id": current_user.id, "email": current_user.email}
```

#### Frontend Issues

**"Failed to fetch" errors**:
```typescript
// Check API base URL
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// Test API connection
fetch('http://localhost:8000/api/health')
  .then(response => response.json())
  .then(data => console.log('API Health:', data))
  .catch(error => console.error('API Error:', error));
```

**State management issues**:
```typescript
// Debug store state
const debugStore = () => {
  const state = useTodoStore.getState();
  console.log('Current state:', {
    tasksCount: state.tasks.length,
    currentPage: state.currentPage,
    authStatus: state.authStatus
  });
};
```

### Development Tools

#### Backend Debugging
```python
# Add request logging middleware
import time
from fastapi import Request

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"{request.method} {request.url} - {response.status_code} - {process_time:.4f}s")
    return response
```

#### Frontend Debugging
```typescript
// Expose store to window for debugging
if (import.meta.env.DEV) {
  (window as any).store = useTodoStore;
  
  // Usage in browser console:
  // store.getState().tasks
  // store.getState().addTask('Debug Task')
}
```

## Performance Optimization

### Backend Performance

#### Async Operations
```python
# Use async/await for I/O operations
@router.get("/tasks/")
async def list_tasks(current_user: User = Depends(get_current_user)):
    # Non-blocking database call
    response = await supabase_client.table('tasks').select('*').execute()
    return response.data
```

#### Response Caching (Future)
```python
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache

@router.get("/tasks/")
@cache(expire=60)  # Cache for 60 seconds
async def list_tasks(current_user: User = Depends(get_current_user)):
    # Expensive operation
    pass
```

### Frontend Performance

#### Component Optimization
```typescript
// Memoize expensive components
const TaskItem = React.memo<TaskItemProps>(({ task, level }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.task.id === nextProps.task.id &&
         prevProps.task.status === nextProps.task.status;
});

// Optimize re-renders with useCallback
const handleTaskToggle = useCallback((taskId: string) => {
  toggleDone(taskId);
}, [toggleDone]);
```

#### Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'], // Prevent pre-bundling for tree-shaking
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          store: ['zustand']
        }
      }
    }
  }
});
```

## Deployment

### Backend Deployment

#### Production Requirements
```txt
# requirements.txt for production
fastapi==0.104.1
uvicorn[standard]==0.24.0
gunicorn==21.2.0
python-dotenv==1.0.0
supabase==2.0.2
pydantic==2.5.0
```

#### Production Server
```bash
# Use Gunicorn with Uvicorn workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Environment Variables
```env
# Production backend .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
```

### Frontend Deployment

#### Build Process
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

#### Environment Variables
```env
# Production frontend .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### Planned Features
- **Real Email Integration**: Connect to Gmail, Outlook, Apple Mail
- **Gemini LLM Integration**: Actual AI responses in Sentinel AI powered by Google Gemini
- **Real-time Collaboration**: Live updates across users
- **Mobile App**: React Native or native iOS/Android
- **Advanced Analytics**: Productivity insights and reporting
- **Workflow Automation**: Zapier-like task automation

### AI Integration

```python
# Gemini LLM integration for Sentinel AI
import google.generativeai as genai

@router.post("/ai/chat")
async def chat_with_ai(message: str, current_user: User = Depends(get_current_user)):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-pro')
    response = await model.generate_content_async(message)
    return {"response": response.text}
```

## Contributing Guidelines

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature-name
git commit -m "feat: add new feature functionality"
git push origin feature/new-feature-name

# Bug fixes
git checkout -b fix/bug-description
git commit -m "fix: resolve specific issue"
```

### Commit Message Format
```
type(scope): description

feat(tasks): add subtask creation functionality
fix(auth): resolve login form validation
docs(readme): update installation instructions
style(ui): improve button hover states
refactor(store): simplify task filtering logic
test(tasks): add unit tests for task operations
```

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Components follow single responsibility principle
- [ ] Error handling is implemented
- [ ] Loading states are shown to users
- [ ] Responsive design works on all screen sizes
- [ ] API endpoints have proper validation
- [ ] Database queries are optimized
- [ ] Security best practices are followed

This comprehensive development guide provides everything needed to work effectively with the Sentinel codebase, from initial setup through advanced development patterns and deployment strategies.