# Render Deployment Fix - 502 Bad Gateway Error

## Problem
Your Render backend is showing a "502 Bad Gateway" error, which means the backend is failing to start properly.

## Solution Steps

### 1. Update Render Service Configuration

Go to your Render dashboard and update your service settings:

**Service Settings:**
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`

### 2. Environment Variables

Make sure these environment variables are set in your Render service:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET_KEY=your_jwt_secret_key
SESSION_SECRET_KEY=your_session_secret_key
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
```

### 3. Python Version

The `runtime.txt` file has been created to specify Python 3.11.0. Render should automatically detect this.

### 4. Commit and Push Changes

```bash
git add .
git commit -m "Fix Render deployment configuration"
git push origin main
```

### 5. Redeploy

After pushing the changes, Render should automatically redeploy. If not, manually trigger a redeploy from the Render dashboard.

## Alternative: Use Railway Instead

If Render continues to have issues, consider using Railway:

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Create a new project
4. Add a service and select your repository
5. Railway will automatically detect the Python backend
6. Add the same environment variables
7. Deploy

## Testing

Once deployed, test your backend:
- Health check: `https://your-backend-url.onrender.com/api/health`
- Root endpoint: `https://your-backend-url.onrender.com/`

## Update Vercel Environment Variables

After your backend is working, update your Vercel environment variables:
- `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com/api`

## Common Issues

1. **Port binding**: Make sure to use `$PORT` environment variable
2. **CORS**: The backend now allows your Vercel domain
3. **Dependencies**: All required packages should be in `requirements.txt`
4. **Python version**: Specified in `runtime.txt`

## Files Modified

- `Procfile`: Updated start command
- `runtime.txt`: Added Python version specification
- `backend/main.py`: Added Vercel domain to CORS origins
