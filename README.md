# Sentinel Todo App

A modern, full-stack productivity application with user-specific categories and real-time task management.

## 🚀 Live Demo

- **Frontend**: [Vercel](https://todolistprototype-henna.vercel.app)
- **Backend API**: [Render](https://todolistprototype.onrender.com)
- **Database**: Supabase

## 🏗️ Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + Python
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (Frontend) + Render (Backend)

## ✨ Features

- ✅ **User-specific categories** - Each user has their own categories
- ✅ **Task management** - Create, update, delete, and organize tasks
- ✅ **Real-time sync** - Data syncs with Supabase database
- ✅ **Authentication** - Secure user login and registration
- ✅ **Responsive design** - Works on desktop and mobile
- ✅ **Guest mode** - Try without signing up

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/todolistprototype.git
cd todolistprototype
npm install
cd backend && pip install -r requirements.txt && cd ..
```

### 2. Set Up Environment Variables

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (.env)**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET_KEY=your_jwt_secret_key
```

### 3. Start Development
```bash
npm run dev:full
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## 🗄️ Database Setup

1. Create a Supabase project
2. Run the SQL from `backend/supabase_setup.sql` in your Supabase SQL editor
3. Set up environment variables

## 📁 Project Structure

```
todolistprototype/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── store.ts           # State management
├── backend/               # FastAPI backend
│   ├── routers/           # API endpoints
│   ├── models.py          # Data models
│   └── main.py            # FastAPI app
└── docs/                  # Documentation
```

## 🔧 Development

### Mock Data vs Real Data

**Mock Data** (Development/Demo):
- Located in `src/store.ts` with clear comments
- Used for guest mode and development
- Includes sample contacts, chats, notifications

**Real Data** (Production):
- Supabase database integration
- User authentication
- Real-time synchronization

### Key Files

- `src/store.ts` - Main state management (Zustand)
- `backend/routers/` - API endpoints
- `backend/database.py` - Database connection
- `src/services/api.ts` - API client

## 🚀 Deployment

### Automatic Deployment
- Push to `main` branch
- Render deploys backend automatically
- Vercel deploys frontend automatically

### Manual Setup
1. **Supabase**: Create project and run migrations
2. **Render**: Connect GitHub repo, set environment variables
3. **Vercel**: Connect GitHub repo, set environment variables

## 📚 API Documentation

### Main Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/tasks/` - List user tasks
- `POST /api/tasks/` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/categories/` - List user categories
- `POST /api/categories/` - Create category

See `API.md` for complete documentation.

## 🔐 Authentication

- **Production**: Supabase Auth with JWT tokens
- **Development**: Guest mode with local storage
- **Security**: Row Level Security (RLS) for data protection

## 🧪 Testing

```bash
# Test backend
curl http://localhost:8000/api/health

# Test frontend
open http://localhost:5173
```

## 📖 Documentation

- `README.md` - This file
- `API.md` - Complete API documentation
- `DEPLOYMENT.md` - Deployment guide
- `DEVELOPMENT.md` - Development setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License

---

**Ready to deploy!** 🚀 This app is production-ready with proper authentication, database integration, and deployment configuration.