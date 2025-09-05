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

### 4. Alternative: Use Railway Instead

If Render continues to have issues, consider using Railway:

1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the backend using the `backend/railway.toml` configuration
4. Add the same environment variables

### 5. Test the Deployment

After making these changes:

1. **Redeploy** your Render service
2. Wait for the deployment to complete
3. Test the health endpoint: `https://todolistprototype.onrender.com/api/health`
4. Update your Vercel environment variables with the new backend URL

### 6. Update Vercel Environment Variables

In your Vercel dashboard, add/update:

```
VITE_API_BASE_URL=https://todolistprototype.onrender.com/api
```

## Common Issues and Solutions

### Issue: "Module not found" errors
**Solution**: Ensure all dependencies are in `requirements.txt` and the build command runs successfully.

### Issue: "Port binding" errors
**Solution**: Make sure the start command uses `$PORT` environment variable and `--host 0.0.0.0`.

### Issue: "Database connection" errors
**Solution**: Verify your Supabase environment variables are correct and the database is accessible.

### Issue: "CORS" errors
**Solution**: The CORS middleware has been updated to allow your Vercel domain.

## Next Steps

1. Update your Render service configuration
2. Redeploy the service
3. Test the health endpoint
4. Update Vercel environment variables
5. Test the full application

If you continue to have issues, consider using Railway as an alternative deployment platform.