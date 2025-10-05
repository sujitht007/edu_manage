# Vercel Deployment Guide

This guide will help you deploy your Course Management System to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A MongoDB Atlas account for the database
3. Your project code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Options

### Option 1: Frontend Only on Vercel + Backend on Railway (Recommended)

This is the recommended approach as it separates concerns and provides better performance.

#### Step 1: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app) and sign up
2. Create a new project
3. Connect your GitHub repository
4. Add a new service and select your backend folder
5. Add the following environment variables in Railway:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/edu_manage?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-app.vercel.app
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
BCRYPT_ROUNDS=12
```

6. Deploy the backend service
7. Note down your Railway backend URL (e.g., `https://your-backend.railway.app`)

#### Step 2: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `REACT_APP_API_URL`: Your Railway backend URL (e.g., `https://your-backend.railway.app`)

6. Deploy the project

7. After deployment, update the `CLIENT_URL` in your Railway backend environment variables to match your Vercel frontend URL.

### Option 2: Full-Stack on Vercel (Serverless Functions)

For this approach, you'll need to convert your backend to Vercel serverless functions.

#### Step 1: Create API Directory Structure

Create a `api` directory in your project root and move your backend routes there as serverless functions.

#### Step 2: Update Vercel Configuration

Update your `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/build"
      }
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

## Environment Variables for Vercel

### Frontend Environment Variables

Add these in your Vercel project settings:

```env
REACT_APP_API_URL=https://your-backend-url.com
```

### Backend Environment Variables (if using serverless)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
MAX_FILE_SIZE=10485760
BCRYPT_ROUNDS=12
```

## Database Setup

1. Create a MongoDB Atlas cluster
2. Create a database user
3. Whitelist your IP addresses (or use 0.0.0.0/0 for all IPs in production)
4. Get your connection string and use it as `MONGODB_URI`

## File Upload Considerations

For file uploads, consider using:
- **Vercel Blob** for file storage
- **AWS S3** with Vercel
- **Cloudinary** for image/video uploads

Update your upload middleware to use these services instead of local file storage.

## CORS Configuration

Make sure your backend CORS is configured to allow your Vercel frontend domain:

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
```

## Deployment Steps Summary

1. **Prepare your code**:
   - Ensure all environment variables are properly configured
   - Update API URLs to use environment variables
   - Test your application locally

2. **Deploy Backend** (Railway recommended):
   - Push code to Git repository
   - Connect Railway to your repository
   - Set environment variables
   - Deploy

3. **Deploy Frontend** (Vercel):
   - Connect Vercel to your repository
   - Configure build settings
   - Set environment variables
   - Deploy

4. **Update Configuration**:
   - Update backend CORS with frontend URL
   - Test the full application

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `CLIENT_URL` in backend matches your Vercel frontend URL
2. **API Not Found**: Check that `REACT_APP_API_URL` is correctly set
3. **Build Failures**: Ensure all dependencies are in `package.json`
4. **Database Connection**: Verify MongoDB URI and network access

### Debugging

1. Check Vercel function logs in the dashboard
2. Use browser developer tools to check network requests
3. Verify environment variables are set correctly
4. Test API endpoints directly

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connection working
- [ ] CORS properly configured
- [ ] File uploads working (if applicable)
- [ ] SSL certificates active
- [ ] Performance optimized
- [ ] Error handling in place
- [ ] Monitoring set up

## Support

For issues specific to:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **Railway**: Check [Railway Documentation](https://docs.railway.app)
- **MongoDB Atlas**: Check [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)


