# ⚡ Quick Deployment Checklist: Render + Vercel

## 🚀 Backend on Render (5 minutes)

### 1. Create Render Service
- [ ] Go to [render.com](https://render.com) → New Web Service
- [ ] Connect GitHub → Select `edu_manage-main` repository
- [ ] Configure:
  - **Name**: `cms-backend`
  - **Root Directory**: `backend`
  - **Environment**: `Node`
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
  - **Plan**: Free

### 2. Add Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edu_manage
JWT_SECRET=your-64-character-secret-key-here
JWT_EXPIRES_IN=7d
PORT=10000
NODE_ENV=production
CLIENT_URL=https://your-frontend-app.vercel.app
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
BCRYPT_ROUNDS=12
```

### 3. Deploy & Test
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (2-5 minutes)
- [ ] Test: `https://your-backend.onrender.com/api/health`
- [ ] Note backend URL

## 🎨 Frontend on Vercel (3 minutes)

### 1. Create Vercel Project
- [ ] Go to [vercel.com](https://vercel.com) → New Project
- [ ] Import GitHub repository
- [ ] Configure:
  - **Framework**: Create React App
  - **Root Directory**: `frontend`
  - **Build Command**: `npm run build`
  - **Output Directory**: `build`

### 2. Add Environment Variable
```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

### 3. Deploy & Test
- [ ] Click "Deploy"
- [ ] Wait for deployment (1-3 minutes)
- [ ] Note frontend URL

## 🔄 Connect Services (2 minutes)

### 1. Update CORS
- [ ] Go to Render dashboard
- [ ] Update `CLIENT_URL` with Vercel frontend URL
- [ ] Redeploy backend

### 2. Test Full Application
- [ ] Visit Vercel frontend URL
- [ ] Test login functionality
- [ ] Verify API calls work

## ✅ Success Indicators

- [ ] Backend health check: `200 OK`
- [ ] Frontend loads without errors
- [ ] Login/logout works
- [ ] API calls successful
- [ ] No CORS errors in browser console

## 🚨 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Node.js version (18+) |
| CORS errors | Update CLIENT_URL in Render |
| API not found | Check REACT_APP_API_URL in Vercel |
| Database error | Verify MongoDB URI format |
| 404 errors | Check root directory settings |

## 📞 Need Help?

- **Render**: [render.com/docs](https://render.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

**Total Time**: ~10 minutes ⏱️
**Cost**: Free tier available on both platforms 💰

