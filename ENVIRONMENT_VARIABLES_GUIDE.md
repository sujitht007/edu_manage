# 🔐 Environment Variables Configuration Guide

This guide provides all the environment variables needed for deploying your Course Management System on Render (backend) and Vercel (frontend).

## 📋 Backend Environment Variables (Render)

### Required Variables for Render Dashboard

Add these environment variables in your Render service dashboard:

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

### How to Add Variables in Render

1. Go to your Render service dashboard
2. Click on "Environment" tab
3. Click "Add Environment Variable"
4. Add each variable with its value
5. Click "Save Changes"
6. Redeploy your service

## 🎨 Frontend Environment Variables (Vercel)

### Required Variables for Vercel Dashboard

Add these environment variables in your Vercel project settings:

```env
# API Configuration
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### How to Add Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add each variable with its value
5. Select environment (Production, Preview, Development)
6. Click "Save"
7. Redeploy your project

## 🔧 Local Development Variables

### Backend (.env file in backend folder)

```env
# Database Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/edu_manage?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=edu_manage_super_secret_jwt_key_2024_secure_random_string_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
BCRYPT_ROUNDS=12
```

### Frontend (.env file in frontend folder)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000
```

## 🔐 Security Best Practices

### JWT Secret Generation
Generate a strong JWT secret:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

### MongoDB URI Security
- Use strong passwords
- Enable authentication
- Whitelist IP addresses
- Use connection string with SSL

### Environment Variable Security
- Never commit .env files to Git
- Use different secrets for different environments
- Rotate secrets regularly
- Use environment-specific configurations

## 📝 Variable Descriptions

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT token signing | `your-64-character-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d`, `24h`, `3600` |
| `PORT` | Server port number | `10000` (Render), `5000` (local) |
| `NODE_ENV` | Environment mode | `production`, `development` |
| `CLIENT_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |
| `MAX_FILE_SIZE` | Maximum file upload size in bytes | `10485760` (10MB) |
| `UPLOAD_PATH` | Local file upload directory | `./uploads` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `https://your-backend.onrender.com` |

## 🚨 Common Issues and Solutions

### Issue 1: Environment Variables Not Loading
**Problem**: Variables not accessible in application
**Solution**: 
- Ensure variables start with `REACT_APP_` for frontend
- Restart development server after adding variables
- Check variable names are exact (case-sensitive)

### Issue 2: CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**:
- Update `CLIENT_URL` in backend with exact frontend URL
- Check protocol (http vs https)
- Verify no trailing slashes

### Issue 3: Database Connection Issues
**Problem**: Backend can't connect to MongoDB
**Solution**:
- Verify MongoDB URI format
- Check username/password in connection string
- Ensure IP whitelist includes deployment platform IPs
- Test connection string in MongoDB Compass

### Issue 4: JWT Token Issues
**Problem**: Authentication not working
**Solution**:
- Ensure JWT_SECRET is set and consistent
- Check JWT_EXPIRES_IN format
- Verify token is being sent in requests

## 🔄 Deployment Workflow

### Step 1: Backend Deployment
1. Set all backend environment variables in Render
2. Deploy backend service
3. Test health endpoint
4. Note backend URL

### Step 2: Frontend Deployment
1. Set `REACT_APP_API_URL` in Vercel with backend URL
2. Deploy frontend
3. Note frontend URL

### Step 3: Update CORS
1. Update `CLIENT_URL` in Render with frontend URL
2. Redeploy backend service
3. Test full application

## 📊 Environment-Specific Configurations

### Development
```env
# Backend
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Frontend
REACT_APP_API_URL=http://localhost:5000
```

### Production
```env
# Backend
NODE_ENV=production
PORT=10000
CLIENT_URL=https://your-app.vercel.app

# Frontend
REACT_APP_API_URL=https://your-backend.onrender.com
```

## 🛠️ Testing Environment Variables

### Backend Testing
```javascript
// Add to server.js for testing
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
```

### Frontend Testing
```javascript
// Add to App.js for testing
console.log('API URL:', process.env.REACT_APP_API_URL);
```

## 📞 Support

If you encounter issues with environment variables:

1. **Check Platform Documentation**:
   - [Render Environment Variables](https://render.com/docs/environment-variables)
   - [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

2. **Verify Variable Names**: Ensure exact spelling and case
3. **Check Variable Values**: Verify no extra spaces or characters
4. **Test Locally**: Ensure variables work in development
5. **Redeploy**: Always redeploy after adding/changing variables

---

**Remember**: Environment variables are case-sensitive and must be set exactly as shown in your application code! 🔐

