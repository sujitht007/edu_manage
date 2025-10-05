# Quick Vercel Deployment Steps

## 1. Prepare Your Repository

Make sure your code is pushed to GitHub, GitLab, or Bitbucket.

## 2. Deploy Backend to Railway (Recommended)

1. Go to [Railway.app](https://railway.app)
2. Sign up and create a new project
3. Connect your repository
4. Add a new service for the `backend` folder
5. Add environment variables from `VERCEL_ENV_VARS.md`
6. Deploy and note the backend URL

## 3. Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your repository
4. Configure:
   - **Framework**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add environment variable:
   - `REACT_APP_API_URL`: Your Railway backend URL
6. Deploy

## 4. Update Backend CORS

After frontend deployment, update the `CLIENT_URL` in Railway to your Vercel frontend URL.

## 5. Test Your Application

Visit your Vercel frontend URL and test all functionality.

## Files Created for Vercel Deployment:

- ✅ `vercel.json` - Root Vercel configuration
- ✅ `frontend/vercel.json` - Frontend-specific configuration
- ✅ `VERCEL_DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- ✅ `VERCEL_ENV_VARS.md` - Environment variables reference
- ✅ Updated API configuration to use environment variables
- ✅ Added vercel-build script to package.json

Your project is now ready for Vercel deployment!
