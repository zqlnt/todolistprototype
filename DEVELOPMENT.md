# Development Guide

This guide explains how to set up and develop the Sentinel Todo App locally.

## Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/todolistprototype.git
cd todolistprototype
```

### 2. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### 3. Set Up Environment Variables

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

### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev:full

# Or start separately:
# Frontend only
npm run dev

# Backend only
npm run dev:api
```

### 5. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
todolistprototype/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── store.ts           # Zustand state management
│   └── types.ts           # TypeScript types
├── backend/               # FastAPI backend
│   ├── routers/           # API routes
│   ├── models.py          # Data models
│   ├── database.py        # Database connection
│   └── main.py            # FastAPI app
└── docs/                  # Documentation
```

## Development Workflow

### Frontend Development

1. **Components**: Add new components in `src/components/`
2. **Pages**: Add new pages in `src/pages/`
3. **State**: Update state in `src/store.ts`
4. **Types**: Add types in `src/types.ts`
5. **API**: Update API calls in `src/services/`

### Backend Development

1. **Routes**: Add new routes in `backend/routers/`
2. **Models**: Update data models in `backend/models.py`
3. **Database**: Update database logic in `backend/database.py`
4. **Auth**: Update authentication in `backend/auth_utils.py`

### Database Development

1. **Migrations**: Add SQL migrations in `supabase/migrations/`
2. **Schema**: Update schema in `backend/supabase_setup.sql`
3. **RLS**: Update Row Level Security policies

## Testing

### Frontend Testing
```bash
# Run tests (if configured)
npm test

# Run linting
npm run lint
```

### Backend Testing
```bash
# Run tests
cd backend
python -m pytest

# Test API endpoints
curl http://localhost:8000/api/health
```

### API Testing
```bash
# Test task creation
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "Test task"}'
```

## Debugging

### Frontend Debugging
- Use React Developer Tools
- Check browser console for errors
- Use Zustand DevTools for state inspection

### Backend Debugging
- Check terminal output for errors
- Use FastAPI's automatic API docs at `/docs`
- Check Supabase logs in dashboard

### Database Debugging
- Check Supabase dashboard for queries
- Use SQL editor for direct database access
- Check RLS policies

## Code Style

### Frontend
- Use TypeScript for all components
- Follow React best practices
- Use Tailwind CSS for styling
- Use Zustand for state management

### Backend
- Use type hints for all functions
- Follow PEP 8 style guide
- Use Pydantic for data validation
- Use FastAPI best practices

## Deployment

### Development Deployment
1. Push to GitHub
2. Render automatically deploys backend
3. Vercel automatically deploys frontend

### Production Deployment
1. Set up Supabase project
2. Configure environment variables
3. Deploy to Render and Vercel
4. Test all functionality

## Authentication

### Development Mode
- Uses fallback database
- No authentication required
- Data stored locally

### Production Mode
- Uses Supabase authentication
- JWT tokens for API access
- Row Level Security for data protection

## Mock Data vs Real Data

### Mock Data (Development)
- Located in `src/store.ts`
- Used for guest mode
- Clearly marked with comments
- Used for development and demo

### Real Data (Production)
- Supabase database
- User authentication
- Real-time synchronization
- Production-ready

## Common Issues

### Frontend Issues
1. **CORS errors**: Check backend CORS settings
2. **API errors**: Check backend logs
3. **State issues**: Check Zustand store

### Backend Issues
1. **Database errors**: Check Supabase connection
2. **Auth errors**: Check JWT configuration
3. **Import errors**: Check Python path

### Database Issues
1. **RLS errors**: Check Supabase policies
2. **Connection errors**: Check environment variables
3. **Query errors**: Check SQL syntax

## Resources

- [React Documentation](https://react.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

Happy coding!
