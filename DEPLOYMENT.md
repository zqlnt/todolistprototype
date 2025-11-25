# Deployment Guide

This document explains how to deploy the Sentinel Todo App to production using Render, Vercel, and Supabase.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │◄──►│   (Render)      │◄──►│   (Supabase)    │
│   React + Vite  │    │   FastAPI       │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Deployment Steps

### 1. Database Setup (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Run Database Migrations**
   ```sql
   -- Run the SQL from backend/supabase_setup.sql in your Supabase SQL editor
   ```

3. **Enable Row Level Security**
   - The setup script automatically enables RLS
   - Verify policies are created correctly

### 2. Backend Deployment (Render)

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Select "Web Service"

2. **Configure Build Settings**
   ```
   Build Command: cd backend && pip install -r requirements.txt
   Start Command: cd backend && python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

3. **Set Environment Variables**
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET_KEY=your_jwt_secret_key
   ```

4. **Deploy**
   - Render will automatically deploy on push to main
   - Note your backend URL (e.g., `https://your-app.onrender.com`)

### 3. Frontend Deployment (Vercel)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select "Next.js" framework (Vite will be auto-detected)

2. **Set Environment Variables**
   ```
   VITE_API_BASE_URL=https://your-app.onrender.com/api
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Deploy**
   - Vercel will automatically deploy on push to main
   - Note your frontend URL (e.g., `https://your-app.vercel.app`)

## Environment Variables

### Backend (.env)
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# JWT Configuration
JWT_SECRET_KEY=your_secret_key_change_in_production

# Optional: Session Secret
SESSION_SECRET_KEY=your_session_secret
```

### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=https://your-backend.onrender.com/api

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Database Configuration

### Required Tables

1. **Tasks Table**
   ```sql
   CREATE TABLE tasks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL,
     title TEXT NOT NULL,
     status TEXT DEFAULT 'pending',
     "dueAt" TIMESTAMPTZ,
     "isStarred" BOOLEAN DEFAULT FALSE,
     category TEXT,
     parent_id UUID REFERENCES tasks(id),
     inserted_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Categories Table**
   ```sql
   CREATE TABLE categories (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL,
     name TEXT NOT NULL,
     color TEXT DEFAULT '#3B82F6',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(user_id, name)
   );
   ```

### Row Level Security (RLS)

The app uses RLS to ensure users can only access their own data:

```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Similar policies for categories...
```

## Health Checks

### Backend Health Check
```bash
curl https://your-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "sentinel-api"
}
```

### Frontend Health Check
```bash
curl https://your-frontend.vercel.app/
```

Should return the React application.

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS settings include your frontend URL
   - Check `backend/main.py` CORS configuration

2. **Authentication Issues**
   - Verify Supabase environment variables
   - Check JWT secret key configuration

3. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies are correctly set

4. **Build Failures**
   - Check Python version compatibility
   - Verify all dependencies are in requirements.txt

### Logs

- **Render**: Check logs in Render dashboard
- **Vercel**: Check logs in Vercel dashboard
- **Supabase**: Check logs in Supabase dashboard

## CI/CD Pipeline

The app uses automatic deployment:

1. **Push to main branch**
2. **Render builds and deploys backend**
3. **Vercel builds and deploys frontend**
4. **Both services are updated automatically**

## Monitoring

### Backend Monitoring (Render)
- CPU and memory usage
- Response times
- Error rates
- Logs and metrics

### Frontend Monitoring (Vercel)
- Build performance
- Page load times
- Error tracking
- Analytics

### Database Monitoring (Supabase)
- Query performance
- Connection usage
- Storage usage
- Real-time metrics

## Security Considerations

1. **Environment Variables**
   - Never commit secrets to Git
   - Use strong, unique secrets
   - Rotate keys regularly

2. **Database Security**
   - RLS policies protect user data
   - Use service role key only on backend
   - Monitor database access

3. **API Security**
   - JWT tokens for authentication
   - CORS properly configured
   - Input validation on all endpoints

## Scaling

### Backend Scaling (Render)
- Upgrade to paid plan for better performance
- Configure auto-scaling
- Use CDN for static assets

### Frontend Scaling (Vercel)
- Vercel automatically handles scaling
- Use Edge Functions for serverless functions
- Configure caching strategies

### Database Scaling (Supabase)
- Upgrade to Pro plan for better performance
- Configure read replicas
- Monitor query performance

---

This deployment setup provides a production-ready, scalable application with proper security and monitoring.
