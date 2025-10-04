# 🚀 Education Management System - Free Hosting Deployment Guide

This guide will help you deploy your MERN stack Education Management System using free hosting platforms.

## 📋 Prerequisites

- GitHub account
- MongoDB Atlas account (free)
- Vercel account (free)
- Railway account (free)

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project

### 1.2 Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select a cloud provider and region close to your users
4. Name your cluster (e.g., "edu-manage-cluster")
5. Click "Create Cluster"

### 1.3 Setup Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 1.4 Setup Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with your database name (e.g., "edu_manage")

**Your connection string:**
```
mongodb+srv://Sujith:9345793342S@cluster0.kpruytr.mongodb.net/edu_manage?retryWrites=true&w=majority&appName=Cluster0
```

## 🚂 Step 2: Deploy Backend to Railway

### 2.1 Prepare Backend for Deployment
1. Create a `.env` file in the `backend` folder:
```bash
# Copy from .env.example and update values
cp backend/.env.example backend/.env
```

2. Update `backend/.env` with your values:
```env
MONGODB_URI=mongodb+srv://Sujith:9345793342S@cluster0.kpruytr.mongodb.net/edu_manage?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=edu_manage_super_secret_jwt_key_2024_secure_random_string_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
```

### 2.2 Deploy to Railway
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select your repository
6. Choose the `backend` folder as the root directory
7. Railway will automatically detect it's a Node.js project

### 2.3 Configure Environment Variables
1. In Railway dashboard, go to your project
2. Click on the service
3. Go to "Variables" tab
4. Add all environment variables from your `.env` file
5. Click "Deploy"

### 2.4 Get Backend URL
1. After deployment, Railway will provide a URL like: `https://your-backend.railway.app`
2. Save this URL - you'll need it for the frontend

## ⚡ Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend for Deployment
1. Create a `.env` file in the `frontend` folder:
```bash
# Copy from .env.example and update values
cp frontend/.env.example frontend/.env
```

2. Update `frontend/.env` with your backend URL:
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_SOCKET_URL=https://your-backend.railway.app
```

### 3.2 Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Add environment variables:
   - `REACT_APP_API_URL`: `https://your-backend.railway.app/api`
   - `REACT_APP_SOCKET_URL`: `https://your-backend.railway.app`
7. Click "Deploy"

### 3.3 Update Backend CORS
1. Go back to Railway dashboard
2. Update the `CLIENT_URL` environment variable to your Vercel URL
3. Redeploy the backend

## 🔧 Step 4: Initialize Database

### 4.1 Create Admin User
1. Go to your Railway backend logs
2. Run the admin creation script by accessing the Railway console or adding a temporary endpoint

### 4.2 Seed Configuration Data
1. Access your backend API at `https://your-backend.railway.app/api/health`
2. Use the configuration seeding script to set up initial data

## 🌐 Step 5: Final Configuration

### 5.1 Update Frontend Environment
1. In Vercel dashboard, go to your project settings
2. Update environment variables with the correct backend URL
3. Redeploy the frontend

### 5.2 Test Your Application
1. Visit your Vercel frontend URL
2. Try registering a new user
3. Test the login functionality
4. Verify all features work correctly

## 📱 Access Your Application

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.railway.app/api`
- **Health Check**: `https://your-backend.railway.app/api/health`

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files to Git
2. **JWT Secret**: Use a strong, random JWT secret
3. **Database Access**: Use strong passwords for database users
4. **CORS**: Configure CORS properly for production
5. **HTTPS**: Both Vercel and Railway provide HTTPS by default

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `CLIENT_URL` in backend matches your frontend URL
2. **Database Connection**: Verify MongoDB Atlas connection string and network access
3. **Build Failures**: Check that all dependencies are in `package.json`
4. **Environment Variables**: Ensure all required variables are set in both platforms

### Useful Commands:

```bash
# Check backend health
curl https://your-backend.railway.app/api/health

# View Railway logs
railway logs

# View Vercel deployment logs
vercel logs
```

## 📊 Monitoring

- **Railway**: Monitor backend performance and logs in Railway dashboard
- **Vercel**: Monitor frontend performance and analytics in Vercel dashboard
- **MongoDB Atlas**: Monitor database performance and usage in Atlas dashboard

## 💰 Cost Breakdown

- **MongoDB Atlas**: Free (M0 tier - 512MB storage)
- **Railway**: Free (500 hours/month, $5 credit)
- **Vercel**: Free (100GB bandwidth, unlimited deployments)

## 🎉 Congratulations!

Your Education Management System is now live on the internet! You can share the Vercel URL with users to access your application.

## 📞 Support

If you encounter any issues:
1. Check the logs in Railway and Vercel dashboards
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas cluster is running and accessible
4. Check that all dependencies are properly installed

---

**Happy Learning! 🎓**
