# 🚀 Complete Deployment Guide: Backend on Render + Frontend on Vercel

This comprehensive guide will help you deploy your Course Management System with the backend hosted on Render and frontend on Vercel.

## 📋 Prerequisites

- [ ] GitHub repository with your code
- [ ] MongoDB Atlas account and cluster
- [ ] Render account (sign up at [render.com](https://render.com))
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] Node.js 18+ installed locally

## 🎯 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │◄──►│   (Render)      │◄──►│   (MongoDB      │
│                 │    │                 │    │    Atlas)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Part 1: Backend Deployment on Render

### Step 1: Prepare Backend for Render

#### 1.1 Update Backend Package.json
Your `backend/package.json` is already configured correctly with:
- ✅ Start script: `"start": "node server.js"`
- ✅ Node version: `"node": ">=18.0.0"`
- ✅ All required dependencies

#### 1.2 Create Render Configuration
Create a new file `backend/render.yaml`:

```yaml
services:
  - type: web
    name: cms-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

#### 1.3 Update Procfile for Render
Update `backend/Procfile`:
```
web: npm start
```

### Step 2: Deploy Backend to Render

#### 2.1 Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your repository: `edu_manage-main`
5. Configure the service:
   - **Name**: `cms-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if you need more resources)

#### 2.2 Configure Environment Variables
In Render dashboard, go to Environment tab and add:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/edu_manage?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-at-least-32-characters
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=10000
NODE_ENV=production

# CORS Configuration (Update after frontend deployment)
CLIENT_URL=https://your-frontend-app.vercel.app

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
BCRYPT_ROUNDS=12
```

#### 2.3 Deploy Backend
1. Click "Create Web Service"
2. Render will automatically build and deploy your backend
3. Wait for deployment to complete (usually 2-5 minutes)
4. Note your Render backend URL (e.g., `https://cms-backend-xxxx.onrender.com`)

#### 2.4 Test Backend Deployment
Test your backend health endpoint:
```
GET https://your-backend-url.onrender.com/api/health
```

Expected response:
```json
{
  "message": "Server is running!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎨 Part 2: Frontend Deployment on Vercel

### Step 1: Prepare Frontend for Vercel

#### 1.1 Update Frontend Configuration
Your `frontend/package.json` is already configured correctly with:
- ✅ Build script: `"build": "react-scripts build"`
- ✅ Vercel build script: `"vercel-build": "react-scripts build"`

#### 1.2 Create Vercel Configuration
Update `frontend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

#### 1.3 Update Environment Variables in Frontend
Create `frontend/.env.production`:

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### Step 2: Deploy Frontend to Vercel

#### 2.1 Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

#### 2.2 Configure Environment Variables
In Vercel project settings, add:

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

#### 2.3 Deploy Frontend
1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. Wait for deployment to complete (usually 1-3 minutes)
4. Note your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

## 🔄 Part 3: Connect Frontend and Backend

### Step 1: Update Backend CORS
1. Go back to Render dashboard
2. Update the `CLIENT_URL` environment variable with your Vercel frontend URL:
   ```
   CLIENT_URL=https://your-app.vercel.app
   ```
3. Redeploy the backend service

### Step 2: Test Full Application
1. Visit your Vercel frontend URL
2. Try logging in with admin credentials
3. Test key functionalities:
   - User registration/login
   - Course creation
   - File uploads
   - Real-time features

## 🗄️ Part 4: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (M0 Sandbox is free)
3. Create a database user with read/write permissions
4. Whitelist IP addresses:
   - For development: Your local IP
   - For production: `0.0.0.0/0` (allows all IPs)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Use this as your `MONGODB_URI` in Render

## 📁 Part 5: File Upload Configuration

### Option 1: Local Storage (Current Setup)
Your current setup uses local file storage. For production, consider:

### Option 2: Cloud Storage (Recommended)
Update your upload middleware to use:
- **AWS S3** with Render
- **Cloudinary** for images/videos
- **Vercel Blob** for file storage

Example Cloudinary integration:
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

## 🔍 Part 6: Testing and Verification

### Backend Health Checks
```bash
# Test health endpoint
curl https://your-backend.onrender.com/api/health

# Test authentication
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Frontend Testing
1. **Load Test**: Check if frontend loads without errors
2. **API Integration**: Verify API calls work
3. **Authentication**: Test login/logout functionality
4. **File Uploads**: Test file upload features
5. **Real-time Features**: Test WebSocket connections

## 🚨 Part 7: Troubleshooting

### Common Issues and Solutions

#### Backend Issues

**1. Build Failures**
```bash
# Check Render build logs
# Common fixes:
- Update Node.js version in package.json
- Check all dependencies are listed
- Verify build command is correct
```

**2. Database Connection Issues**
```bash
# Verify MongoDB URI format
mongodb+srv://username:password@cluster.mongodb.net/database

# Check network access in MongoDB Atlas
# Ensure IP whitelist includes 0.0.0.0/0
```

**3. CORS Errors**
```javascript
// Update CORS configuration in server.js
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://your-app.vercel.app',
  credentials: true
}));
```

#### Frontend Issues

**1. Build Failures**
```bash
# Check Vercel build logs
# Common fixes:
- Update React Scripts version
- Check for TypeScript errors
- Verify all imports are correct
```

**2. API Connection Issues**
```javascript
// Verify environment variable
console.log(process.env.REACT_APP_API_URL);

// Check API URL format
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

**3. Environment Variables Not Loading**
```bash
# Ensure variables start with REACT_APP_
REACT_APP_API_URL=https://your-backend.onrender.com

# Redeploy after adding variables
```

### Performance Optimization

#### Backend (Render)
- Use paid plans for better performance
- Implement caching strategies
- Optimize database queries
- Use CDN for static files

#### Frontend (Vercel)
- Enable Vercel Analytics
- Use Vercel's Edge Functions
- Implement code splitting
- Optimize images and assets

## 📊 Part 8: Monitoring and Maintenance

### Render Monitoring
- Monitor CPU and memory usage
- Check deployment logs
- Set up health check alerts
- Monitor response times

### Vercel Monitoring
- Use Vercel Analytics
- Monitor Core Web Vitals
- Check function execution logs
- Monitor build performance

### Database Monitoring
- Monitor MongoDB Atlas metrics
- Set up alerts for connection issues
- Regular backup verification
- Performance monitoring

## 🎯 Part 9: Production Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] CORS properly configured
- [ ] File uploads working
- [ ] Authentication flow tested
- [ ] Error handling implemented

### Post-Deployment
- [ ] Health checks passing
- [ ] SSL certificates active
- [ ] Performance optimized
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Documentation updated

## 🔐 Part 10: Security Considerations

### Environment Variables
- Use strong, unique secrets
- Never commit secrets to Git
- Rotate secrets regularly
- Use different secrets for different environments

### CORS Configuration
```javascript
// Production CORS
app.use(cors({
  origin: ['https://your-app.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Database Security
- Use strong database passwords
- Enable MongoDB Atlas security features
- Regular security updates
- Monitor access logs

## 📞 Support and Resources

### Documentation
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)

### Community Support
- [Render Community](https://community.render.com)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [MongoDB Community](https://community.mongodb.com)

---

## 🎉 Success!

Once completed, you'll have:
- ✅ Backend running on Render with auto-scaling
- ✅ Frontend deployed on Vercel with global CDN
- ✅ Database hosted on MongoDB Atlas
- ✅ Full-stack application accessible worldwide

Your Course Management System is now live and ready for users! 🚀
