# Vercel Environment Variables Configuration

## Frontend Environment Variables (Vercel)

Add these environment variables in your Vercel project settings:

### Required Variables

```env
REACT_APP_API_URL=https://your-backend.railway.app
```

### How to Add Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Click on your project
3. Go to the "Settings" tab
4. Click on "Environment Variables"
5. Click "Add" for each environment variable above
6. Set the environment to "Production", "Preview", and "Development" as needed

## Backend Environment Variables (Railway)

If you're using Railway for the backend, add these environment variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edu_manage?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
BCRYPT_ROUNDS=12
```

## Important Notes:

1. **Update CLIENT_URL**: After deploying your frontend to Vercel, update the `CLIENT_URL` in your backend (Railway) to match your Vercel frontend URL.

2. **MongoDB URI**: Replace the MongoDB URI with your actual MongoDB Atlas connection string.

3. **JWT Secret**: Use a strong, random JWT secret for production.

4. **CORS**: The backend CORS is configured to use `CLIENT_URL`, so make sure it matches your Vercel frontend URL.

## Example URLs:

- Frontend (Vercel): `https://your-app-name.vercel.app`
- Backend (Railway): `https://your-backend.railway.app`
- MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database`
