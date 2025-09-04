# Sentinel - Smart Productivity Application

A modern, intelligent productivity application with Python FastAPI backend, React frontend, and Supabase database integration. Sentinel combines traditional task management with AI-powered insights and multi-platform data synchronization.

## Architecture Overview

Sentinel uses a three-tier architecture:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend API**: Python FastAPI + Pydantic + Uvicorn
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth managed through FastAPI endpoints
- **State Management**: Zustand with persistence
- **UI Components**: Custom components with Lucide React icons

### Why FastAPI Backend?

Instead of connecting React directly to Supabase, we use FastAPI as an intermediary layer for:

- **Enhanced Security**: Centralized authentication and authorization
- **Business Logic**: Complex data processing and validation
- **API Consistency**: Standardized endpoints with automatic documentation
- **Scalability**: Easy integration with external services and caching
- **Type Safety**: Pydantic models ensure data validation
- **Performance**: One of the fastest Python frameworks available

## Project Structure

```
sentinel/
├── backend/                    # Python FastAPI backend
│   ├── routers/               # API route handlers
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── tasks.py          # Task management endpoints
│   │   └── emails.py         # Email sync endpoints
│   ├── models.py             # Pydantic data models
│   ├── database.py           # Supabase client configuration
│   ├── main.py               # FastAPI application setup
│   ├── run.py                # Development server runner
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Backend environment template
├── src/                      # React frontend
│   ├── components/           # Reusable UI components
│   ├── pages/               # Main application pages
│   ├── services/            # API service layer
│   ├── types.ts             # TypeScript type definitions
│   ├── store.ts             # Zustand state management
│   └── rules.ts             # Business logic and data processing
├── docs/                    # Comprehensive documentation
├── supabase/               # Database migrations and schema
└── package.json            # Frontend dependencies and scripts
```

## Features

### Core Functionality
- **Hierarchical Task Management**: Tasks with unlimited subtasks
- **Smart Categorization**: Time-based and category-based organization
- **Priority System**: Star important tasks for quick filtering
- **Due Date Management**: Optional deadlines with time tracking
- **Real-time Sync**: Changes reflected immediately across sessions

### Multi-Platform Integration
- **Email Sync**: Mock email fetching with task suggestions (ready for real providers)
- **Calendar Integration**: View tasks alongside calendar events
- **Contact Management**: Store and organize contacts with favorites
- **Chat System**: Messaging interface with unread indicators
- **Notifications**: System-wide notification management

### Intelligent Features
- **AI Assistant**: Sentinel AI chat interface (ready for LLM integration)
- **Task Suggestions**: Auto-generate tasks from email content
- **Smart Grouping**: Organize by time sections or categories
- **Priority Detection**: Automatic priority scoring

### User Experience
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Dark/Light Theme**: User preference support (ready for implementation)
- **Keyboard Shortcuts**: Efficient navigation (planned)
- **Offline Support**: Local storage fallback (planned)

## Quick Start

### Prerequisites
- **Node.js 18+** for the React frontend
- **Python 3.8+** for the FastAPI backend
- **Supabase account** for database and authentication (optional - fallback database available)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd sentinel
npm install
```

### 2. Backend Setup (Required)

The FastAPI backend must be running for the application to work.

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

#### Option A: Use Supabase (Recommended for Production)

Edit `backend/.env` with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
USE_FALLBACK_DB=false
SECRET_KEY=your-secret-key-change-in-production
```

#### Option B: Use SQLite Fallback Database (Quick Start)

If you don't have Supabase set up or want to test quickly, you can use the built-in SQLite fallback database:

```env
# Leave Supabase variables empty or remove them
USE_FALLBACK_DB=true
SECRET_KEY=your-secret-key-change-in-production
```

The SQLite database will be automatically created as `sentinel_fallback.db` in the backend directory.

**Note**: The fallback database is perfect for development and testing, but Supabase is recommended for production use due to its advanced features like Row Level Security, real-time updates, and scalability.

### 3. Frontend Setup

```bash
# Create frontend environment file (in project root)
cp .env.example .env
```

#### For Supabase Setup:
Edit `.env` with your Supabase configuration:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000/api
```

#### For SQLite Fallback:
Edit `.env` with minimal configuration:
```env
VITE_API_BASE_URL=http://localhost:8000/api
# Supabase variables can be left empty when using fallback
```

### 4. Database Setup

#### For Supabase:
Ensure your Supabase project has the required tables. The migration files in `supabase/migrations/` contain the schema.

#### For SQLite Fallback:
No additional setup required! The database will be automatically created when you start the backend.

### 5. Running the Application

**You need TWO terminal windows running simultaneously:**

**Terminal 1 - Backend (FastAPI):**
```bash
cd backend
source venv/bin/activate  # If using virtual environment
python run.py
```
✅ Backend running at `http://localhost:8000`
✅ Database: Will show "Using Supabase database" or "Using SQLite fallback database"

**Terminal 2 - Frontend (React):**
```bash
npm run dev
```
✅ Frontend running at `http://localhost:5173`

**Alternative - Run Both Services:**
```bash
npm run dev:full
```
This runs both frontend and backend concurrently.

### 6. Access the Application

Open your browser to `http://localhost:5173` and create an account or sign in.

## Database Options

### SQLite Fallback Database

The application includes a built-in SQLite fallback database that provides:

- **Zero Configuration**: Automatically creates database and tables
- **Full Feature Support**: All task management features work identically
- **JWT Authentication**: Secure token-based authentication
- **Development Ready**: Perfect for local development and testing
- **Data Persistence**: Your data is saved in `backend/sentinel_fallback.db`

**When to use SQLite fallback:**
- Quick development setup
- Testing and prototyping
- Offline development
- Learning the codebase
- When Supabase is unavailable

### Supabase Database (Recommended)

Supabase provides enterprise-grade features:

- **Row Level Security (RLS)**: Database-level access control
- **Real-time Updates**: Live data synchronization
- **Scalability**: Handles large datasets and concurrent users
- **Advanced Auth**: Social logins, email verification, password reset
- **Backup & Recovery**: Automated backups and point-in-time recovery
- **Analytics**: Built-in usage analytics and monitoring

**When to use Supabase:**
- Production deployments
- Team collaboration
- Advanced authentication needs
- Real-time features
- Scalable applications

### Switching Between Databases

You can easily switch between databases by changing the `USE_FALLBACK_DB` environment variable in `backend/.env`:

```bash
# Use SQLite fallback
USE_FALLBACK_DB=true

# Use Supabase
USE_FALLBACK_DB=false
```

Restart the backend server after changing this setting.

## API Documentation

With the FastAPI backend running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

The API works identically regardless of which database you're using.

## Troubleshooting

### Common Issues

**"Failed to fetch" Error:**
- ✅ Ensure FastAPI backend is running (`python backend/run.py`)
- ✅ Check `VITE_API_BASE_URL` points to `http://localhost:8000/api`
- ✅ Verify CORS settings in `backend/main.py`

**Database Connection Issues:**

*For Supabase:*
- ✅ Verify Supabase URL and keys are correct
- ✅ Check Supabase project settings and RLS policies
- ✅ Ensure service role key has proper permissions

*For SQLite Fallback:*
- ✅ Ensure `USE_FALLBACK_DB=true` in `backend/.env`
- ✅ Check that the backend directory is writable
- ✅ Look for `sentinel_fallback.db` file creation

**Authentication Issues:**
- ✅ Check that `SECRET_KEY` is set in `backend/.env`
- ✅ Verify JWT tokens are being generated (check browser dev tools)
- ✅ Ensure consistent authentication method (Supabase vs fallback)

**Development Server Issues:**
- ✅ Check if ports 8000 (backend) and 5173 (frontend) are available
- ✅ Ensure Python virtual environment is activated
- ✅ Verify all dependencies are installed (`pip install -r requirements.txt`)

### Database Status Check

When you start the backend, it will clearly indicate which database is being used:

```bash
# SQLite fallback
Using SQLite fallback database
Starting up FastAPI server...

# Supabase
Using Supabase database  
Starting up FastAPI server...
```

### Getting Help

1. Check the browser console for detailed error messages
2. Review FastAPI logs in the backend terminal
3. Use Swagger UI at `http://localhost:8000/docs` to test API endpoints
4. For Supabase issues, check the Supabase dashboard
5. For SQLite issues, check if `sentinel_fallback.db` exists and is readable

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

### 4. Database Setup

Ensure your Supabase project has the required tables. The migration files in `supabase/migrations/` contain the schema.

### 5. Running the Application

**You need TWO terminal windows running simultaneously:**

**Terminal 1 - Backend (FastAPI):**
```bash
cd backend
source venv/bin/activate  # If using virtual environment
python run.py
```
✅ Backend running at `http://localhost:8000`

**Terminal 2 - Frontend (React):**
```bash
npm run dev
```
✅ Frontend running at `http://localhost:5173`

**Alternative - Run Both Services:**
```bash
npm run dev:full
```
This runs both frontend and backend concurrently.

### 6. Access the Application

Open your browser to `http://localhost:5173` and create an account or sign in.

## API Documentation

With the FastAPI backend running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### API Endpoints

#### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User sign out
- `GET /api/auth/user` - Get user information

#### Tasks
- `GET /api/tasks/` - List all user tasks
- `POST /api/tasks/` - Create new task
- `PUT /api/tasks/{task_id}` - Update task
- `DELETE /api/tasks/{task_id}` - Delete task
- `PUT /api/tasks/{task_id}/status` - Toggle task completion
- `PUT /api/tasks/{task_id}/star` - Toggle task priority

#### Emails
- `GET /api/emails/` - Get user emails
- `POST /api/emails/sync` - Sync emails and generate suggestions
- `GET /api/emails/suggestions` - Get task suggestions from emails

## Development

### Backend Development

The FastAPI backend follows a modular structure:

- **`main.py`**: Application setup, middleware, and route inclusion
- **`routers/`**: Endpoint handlers organized by feature
- **`models.py`**: Pydantic models for request/response validation
- **`database.py`**: Supabase client configuration
- **`run.py`**: Development server with hot reload

#### Adding New Endpoints

1. Define Pydantic models in `models.py`
2. Create router in `routers/` directory
3. Include router in `main.py`
4. Test with automatic Swagger documentation

#### Database Operations

All database operations go through the Supabase client:

```python
from database import supabase_client

# Example query
response = supabase_client.table('tasks').select('*').eq('user_id', user_id).execute()
```

### Frontend Development

The React frontend uses a service layer to communicate with the FastAPI backend:

- **`services/api.ts`**: HTTP client for API communication
- **`services/tasks.ts`**: Task-specific API operations
- **`store.ts`**: Zustand store with API integration
- **`components/`**: Reusable UI components
- **`pages/`**: Main application views

#### Adding New Features

1. Define TypeScript types in `types.ts`
2. Add API service functions in `services/`
3. Update Zustand store actions
4. Create/update React components
5. Add routing if needed

### Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Code linting with React and TypeScript rules
- **Tailwind CSS**: Utility-first styling with responsive design
- **Component Architecture**: Single responsibility principle
- **Error Handling**: Comprehensive error boundaries and user feedback

## Deployment

### Backend Deployment

Deploy the FastAPI backend to cloud platforms:

**Railway/Render/Heroku:**
```bash
# Ensure requirements.txt is up to date
pip freeze > requirements.txt

# Deploy with Gunicorn for production
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

**Environment Variables for Production:**
```env
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
```

### Frontend Deployment

Deploy the React frontend to static hosting:

**Vercel/Netlify:**
```bash
npm run build
```

**Environment Variables for Production:**
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### Database Deployment

Supabase handles database hosting. Ensure:
- Row Level Security (RLS) is enabled
- Proper policies are in place
- Environment variables point to production instance

## Troubleshooting

### Common Issues

**"Failed to fetch" Error:**
- ✅ Ensure FastAPI backend is running (`python run.py`)
- ✅ Check `VITE_API_BASE_URL` points to correct backend URL
- ✅ Verify CORS settings in `backend/main.py`

**Authentication Issues:**
- ✅ Verify Supabase environment variables in `backend/.env`
- ✅ Check Supabase project settings and RLS policies
- ✅ Ensure service role key has proper permissions

**Database Connection Issues:**
- ✅ Verify Supabase URL and keys are correct
- ✅ Check network connectivity to Supabase
- ✅ Ensure database schema matches migration files

**Development Server Issues:**
- ✅ Check if ports 8000 (backend) and 5173 (frontend) are available
- ✅ Ensure Python virtual environment is activated
- ✅ Verify all dependencies are installed

### Getting Help

1. Check the browser console for detailed error messages
2. Review FastAPI logs in the backend terminal
3. Use Swagger UI at `http://localhost:8000/docs` to test API endpoints
4. Check Supabase dashboard for database and auth issues

## Architecture Benefits

### FastAPI Advantages
- **Performance**: Async support and high throughput
- **Type Safety**: Automatic validation with Pydantic
- **Documentation**: Auto-generated OpenAPI/Swagger docs
- **Modern Python**: Uses latest Python features and type hints
- **Ecosystem**: Easy integration with ML libraries and external APIs

### Development Benefits
- **Separation of Concerns**: Clear distinction between frontend and backend logic
- **Scalability**: Easy to add caching, background tasks, and microservices
- **Testing**: Excellent testing support with pytest and FastAPI TestClient
- **Debugging**: Clear error messages and request/response logging
- **Team Development**: Frontend and backend teams can work independently

### Production Benefits
- **Security**: Centralized authentication and input validation
- **Monitoring**: Easy to add logging, metrics, and health checks
- **Deployment**: Independent scaling of frontend and backend
- **Maintenance**: Clear API contracts and versioning support

## Future Enhancements

### Planned Features
- **Real Email Integration**: Connect to Gmail, Outlook, Apple Mail
- **LLM Integration**: Actual AI responses in Sentinel AI
- **Real-time Collaboration**: Live updates across users
- **Mobile App**: React Native or native iOS/Android
- **Advanced Analytics**: Productivity insights and reporting
- **Workflow Automation**: Zapier-like task automation

### Technical Improvements
- **Caching**: Redis integration for improved performance
- **Background Tasks**: Celery for email sync and processing
- **WebSocket Support**: Real-time updates and notifications
- **API Versioning**: Support for multiple API versions
- **Comprehensive Testing**: Unit, integration, and E2E tests

## Contributing

### Development Setup
1. Fork the repository
2. Set up both backend and frontend as described above
3. Create a feature branch
4. Make changes with proper tests
5. Submit a pull request

### Code Standards
- Follow TypeScript strict mode for frontend
- Use Pydantic models for all API data
- Maintain component modularity
- Write descriptive commit messages
- Test authentication flows thoroughly
- Verify responsive design on multiple screen sizes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Sentinel** - Your intelligent productivity assistant, powered by modern web technologies and AI-ready architecture.