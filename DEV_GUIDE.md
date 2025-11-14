# Development Guide

Complete guide for local development and deployment workflow.

## 🚀 Quick Start - Local Development

### Prerequisites
- Node.js v18+ installed
- Python 3.9+ installed
- Git installed

### Step 1: Run Backend Locally

```bash
# Navigate to server directory
cd server

# Install Python dependencies (first time only)
pip install -r requirements.txt

# Start Flask server
python app.py
```

**Backend will run on**: http://localhost:5000

You should see:
```
✅ Database connection pool created successfully
🔍 Testing database connection...
✅ Database connection successful!
 * Running on http://0.0.0.0:5000
```

### Step 2: Run Frontend Locally (New Terminal)

```bash
# Open NEW terminal window (keep backend running)

# Install dependencies (first time only)
npm install --legacy-peer-deps

# Start Vite dev server
npm run dev
```

**Frontend will run on**: http://localhost:5173

You should see:
```
🔧 Running in DEVELOPMENT mode
📡 API Base URL: http://localhost:5000/api

  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

### Step 3: Test Your App

1. Open browser: http://localhost:5173
2. Login with test credentials
3. Test all features
4. Check browser console for errors

## 📝 Development Workflow

### Making Changes

```bash
# 1. Make your code changes
# 2. Test locally (frontend: http://localhost:5173)
# 3. If everything works, commit and push

git add .
git commit -m "Your descriptive message"
git push
```

### Auto-Deployment

**⚠️ IMPORTANT**: Every `git push` automatically deploys to production!

- **Frontend**: Vercel auto-deploys from GitHub main branch
- **Backend**: Render auto-deploys (if configured) or manual redeploy needed

### Recommended Workflow

**Option 1: Test Before Push (Safer)**
```bash
# 1. Make changes
# 2. Test locally thoroughly
# 3. Only push when ready for production
git push
```

**Option 2: Use Branches (Best Practice)**
```bash
# 1. Create feature branch
git checkout -b feature/my-new-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push to feature branch (won't deploy)
git push origin feature/my-new-feature

# 4. Test thoroughly locally

# 5. When ready, merge to main
git checkout main
git merge feature/my-new-feature
git push  # This deploys to production
```

## 🔧 Local Testing Tips

### Backend Testing

**Test API Endpoints:**
```bash
# Health check
curl http://localhost:5000/api/health

# Keep-alive
curl http://localhost:5000/api/keep-alive

# Login (replace with your employee_id)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employee_id":"your_id","password":"your_password"}'
```

### Frontend Testing

**Check Environment:**
- Open browser DevTools → Console
- Should see: `🔧 Running in DEVELOPMENT mode`
- Should see: `📡 API Base URL: http://localhost:5000/api`

**Test Features:**
- [ ] Login/Signup
- [ ] Home page loads all data
- [ ] Targets toggle (daily/weekly)
- [ ] Leaderboard toggles
- [ ] Customer lists
- [ ] Customers page with metric selection
- [ ] Pull to refresh
- [ ] Global refresh
- [ ] Notifications

## 🐛 Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Windows: Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Or change port in server/app.py (line 1148)
port = int(os.environ.get('PORT', 5001))  # Use 5001
```

**Database connection error:**
```bash
# Check if MySQL server is reachable
ping 116.202.114.156

# Verify credentials in server/app.py (lines 27-33)
```

**Import errors:**
```bash
# Reinstall dependencies
pip install -r server/requirements.txt --upgrade
```

### Frontend Issues

**Blank page:**
```bash
# Force Vite to rebuild
npx vite --force

# Or clear cache
rm -rf node_modules/.vite
npm run dev
```

**API calls failing:**
- Check backend is running (http://localhost:5000/api/health)
- Check browser console for CORS errors
- Verify `API_BASE_URL` in console shows localhost

**npm install fails:**
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Or clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 📦 Environment Configuration

### Development vs Production

**File**: `src/config.js`

```javascript
// Automatically switches based on build mode
export const API_BASE_URL = import.meta.env.PROD
  ? 'https://executive-sales-assistant.onrender.com/api'  // Production
  : 'http://localhost:5000/api';  // Development
```

**How it works:**
- `npm run dev` → Uses localhost backend
- `npm run build` → Uses production backend (Render)

### Testing Production Build Locally

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Opens on http://localhost:4173 with **production API URLs**

## 🚢 Deployment Process

### Current Auto-Deploy Setup

**Frontend (Vercel):**
1. You push to GitHub main branch
2. Vercel detects push
3. Runs `npm run build`
4. Deploys to https://your-app.vercel.app
5. Takes ~2-3 minutes

**Backend (Render):**
1. Manual redeploy OR auto-deploy if configured
2. Runs `pip install -r requirements.txt`
3. Starts with `gunicorn app:app`
4. Takes ~3-5 minutes

### Checking Deployment Status

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Logs show build progress
- Deployments tab shows history

**Render:**
- Dashboard: https://dashboard.render.com
- Events tab shows deploy progress
- Logs tab shows runtime logs

## 🔄 Common Development Tasks

### Add New Feature

```bash
# 1. Create branch
git checkout -b feature/new-feature

# 2. Code locally
# Edit files...

# 3. Test locally
npm run dev  # Test frontend
# Test all functionality

# 4. Commit
git add .
git commit -m "feat: Add new feature"

# 5. Push to feature branch (safe, won't deploy)
git push origin feature/new-feature

# 6. When ready, merge and deploy
git checkout main
git merge feature/new-feature
git push  # Deploys to production
```

### Fix Bug

```bash
# 1. Create fix branch
git checkout -b fix/bug-description

# 2. Fix code locally

# 3. Test thoroughly
npm run dev

# 4. When confirmed fixed, deploy
git checkout main
git merge fix/bug-description
git push
```

### Update Dependencies

```bash
# Frontend
npm update
npm audit fix

# Backend
pip install -r requirements.txt --upgrade
pip freeze > requirements.txt

# Test locally before deploying
```

## 📊 Monitoring Production

### Check Production Health

```bash
# Backend health
curl https://executive-sales-assistant.onrender.com/api/health

# Frontend
# Open in browser and check console for errors
```

### View Production Logs

**Vercel:**
- Go to: https://vercel.com/dashboard
- Select your project
- Click "Logs" tab

**Render:**
- Go to: https://dashboard.render.com
- Select your service
- Click "Logs" tab

### Performance Monitoring

**Frontend (Vercel Analytics):**
- Real user metrics
- Core Web Vitals
- Page load times

**Backend (Render Logs):**
- Response times
- Error rates
- Database query performance

## ⚙️ Configuration Files

### Key Files to Know

**Frontend:**
- `vite.config.js` - Vite configuration
- `vercel.json` - Vercel deployment config
- `src/config.js` - API URL configuration
- `package.json` - Dependencies and scripts

**Backend:**
- `server/app.py` - Main Flask application
- `server/requirements.txt` - Python dependencies
- `render.yaml` - Render deployment config

**Shared:**
- `.gitignore` - Files not tracked by git
- `README.md` - Project documentation
- `PERFORMANCE.md` - Performance optimization guide
- `EVENT_TRACKING.md` - Analytics documentation

## 🛡️ Best Practices

### Before Pushing to Production

- [ ] Test all features locally
- [ ] Check browser console for errors
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Check API response times
- [ ] Verify database queries work
- [ ] Review code changes one more time

### Code Quality

- Use meaningful commit messages
- Comment complex logic
- Follow existing code style
- Test edge cases
- Handle errors gracefully

### Git Workflow

```bash
# Good commit message examples
git commit -m "feat: Add customer detail modal"
git commit -m "fix: Resolve login timeout issue"
git commit -m "perf: Optimize database queries"
git commit -m "docs: Update README with deployment steps"

# Bad commit messages (avoid)
git commit -m "changes"
git commit -m "fix"
git commit -m "update"
```

## 🚨 Emergency Rollback

If production breaks after deployment:

### Vercel Rollback

1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments" tab
4. Find last working deployment
5. Click "..." → "Promote to Production"

### Render Rollback

1. Go to Render dashboard
2. Select your service
3. Click "Manual Deploy" → "Clear build cache & deploy"
4. Or: Revert git commit and push

### Git Revert

```bash
# Find commit to revert
git log

# Revert to previous commit
git revert <commit-hash>
git push

# Or reset to previous state (destructive)
git reset --hard <commit-hash>
git push --force  # ⚠️ Use with caution
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [React Documentation](https://react.dev/)

## 🆘 Getting Help

### Debug Checklist

1. Check browser console for frontend errors
2. Check backend terminal for API errors
3. Check network tab in DevTools
4. Verify API_BASE_URL is correct
5. Test API endpoints with curl
6. Check Render/Vercel logs
7. Review recent git commits

### Common Error Solutions

**"Failed to fetch":**
- Backend not running
- Wrong API URL
- CORS issue

**"Database connection failed":**
- MySQL server down
- Wrong credentials
- Network issue

**"Build failed":**
- Missing dependencies
- Syntax error in code
- Environment variable missing

---

**Remember**: Local testing prevents production bugs! 🎯

**Last Updated**: 2025-11-10
