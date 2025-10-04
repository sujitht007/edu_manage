# Railway Environment Variables Configuration

Copy and paste these environment variables into your Railway project:

## Required Environment Variables for Railway

```
MONGODB_URI=mongodb+srv://Sujith:9345793342S@cluster0.kpruytr.mongodb.net/edu_manage?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=edu_manage_super_secret_jwt_key_2024_secure_random_string_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
BCRYPT_ROUNDS=12
```

## How to Add Environment Variables in Railway:

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to the "Variables" tab
4. Click "Add Variable" for each environment variable above
5. Copy the exact values from above
6. **Important**: Update `CLIENT_URL` with your actual Vercel frontend URL after deployment

## After Frontend Deployment:

Once your frontend is deployed on Vercel, update the `CLIENT_URL` variable in Railway to:
```
CLIENT_URL=https://your-actual-app-name.vercel.app
```

Replace `your-actual-app-name` with your actual Vercel app URL.
