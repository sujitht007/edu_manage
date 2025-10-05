# 🚂 Railway Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Package.json Configuration
- [x] **Start script**: `"start": "node server.js"`
- [x] **Build script**: `"build": "echo 'No build step required for Node.js'"`
- [x] **Postinstall script**: `"postinstall": "echo 'Dependencies installed successfully'"`
- [x] **Node version**: `"node": ">=18.0.0"`
- [x] **NPM version**: `"npm": ">=8.0.0"`

### 2. Railway Configuration Files
- [x] **railway.json**: Configured with health check
- [x] **Procfile**: `web: npm start`
- [x] **.nvmrc**: Node.js version 18.18.0

### 3. Environment Variables (Add these in Railway Dashboard)
```
MONGODB_URI=mongodb+srv://Sujith:9345793342S@cluster0.kpruytr.mongodb.net/edu_manage?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=edu_manage_super_secret_jwt_key_2024_secure_random_string_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
BCRYPT_ROUNDS=12
```

## 🚀 Railway Deployment Steps

### Step 1: Connect GitHub Repository
1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `edu_manage-main` repository

### Step 2: Configure Service
1. **Root Directory**: Leave as root (/) - we'll use commands to navigate
2. **Build Command**: `cd backend && npm install`
3. **Start Command**: `cd backend && npm start`

**Alternative Method**: Set Root Directory to `backend` in Railway dashboard

### Step 3: Add Environment Variables
1. Go to your service dashboard
2. Click "Variables" tab
3. Add each environment variable from the list above
4. **Important**: Update `CLIENT_URL` after frontend deployment

### Step 4: Deploy
1. Railway will automatically start building
2. Monitor the build logs
3. Wait for "DEPLOYED" status
4. Get your Railway URL

## 🔍 Troubleshooting

### Common Issues:

#### Build Fails
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs for specific errors

#### Environment Variables Not Working
- Ensure all variables are set in Railway dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

#### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check network access in MongoDB Atlas
- Ensure database user has proper permissions

#### CORS Errors
- Update `CLIENT_URL` with correct frontend URL
- Check CORS configuration in server.js

### Health Check
After deployment, test: `https://your-app.railway.app/api/health`

Expected response:
```json
{
  "message": "Server is running!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📊 Monitoring

### Railway Dashboard
- Monitor CPU and memory usage
- Check deployment logs
- View environment variables
- Monitor health status

### Useful Commands
```bash
# Check deployment status
railway status

# View logs
railway logs

# Connect to service
railway connect
```

## 🎯 Success Indicators

- [ ] Build completes without errors
- [ ] Service shows "DEPLOYED" status
- [ ] Health check endpoint responds
- [ ] Database connection successful
- [ ] All environment variables loaded
- [ ] Service accessible via Railway URL

## 🔄 Next Steps After Deployment

1. **Get Railway URL** (e.g., `https://xxx.railway.app`)
2. **Test health endpoint**: `/api/health`
3. **Update frontend environment variables** with Railway URL
4. **Deploy frontend to Vercel**
5. **Update Railway CLIENT_URL** with Vercel URL
6. **Test full application**

---

**Ready to deploy?** Follow this checklist step by step! 🚀
