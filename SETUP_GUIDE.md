# Sales Executive App - Complete Setup Guide

## Quick Start Summary

This Sales Executive WebApp has two parts:
1. **Frontend** (React + Vite) - Runs on port 5173
2. **Backend** (Node.js + Express + MySQL) - Runs on port 5000

Both need to be running simultaneously for the app to work with database authentication.

---

## Part 1: Backend Setup (Must do first!)

### Step 1: Navigate to server directory
```bash
cd server
```

### Step 2: Install dependencies

**Try this first:**
```bash
npm install
```

**If that fails, open PowerShell/CMD as Administrator and try:**
```bash
npm install --legacy-peer-deps
```

**If still fails, install packages one by one:**
```bash
npm install express
npm install mysql2
npm install bcrypt
npm install cors
npm install dotenv
npm install jsonwebtoken
npm install nodemon --save-dev
```

### Step 3: Create the database table

Connect to your MySQL database and run:

```sql
CREATE TABLE IF NOT EXISTS SalesExecutiveApp_Login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Step 4: Start the backend server

**Development mode (auto-reload):**
```bash
npm run dev
```

**OR Normal mode:**
```bash
npm start
```

**Expected output:**
```
✅ Database connected successfully!
🚀 Server is running on http://localhost:5000
📊 API endpoints available at http://localhost:5000/api
```

### Step 5: Test the backend (Optional)

Open a browser and go to: `http://localhost:5000/api/health`

You should see:
```json
{
  "success": true,
  "message": "Sales Executive App API is running!",
  "timestamp": "2025-10-23T..."
}
```

---

## Part 2: Frontend Setup

### Step 1: Open a NEW terminal (keep backend running!)

### Step 2: Navigate to project root
```bash
cd c:\Users\NC24028_Manojkumar M\SalesExecutiveApp
```

### Step 3: Start the frontend
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Open the app
Open your browser and go to: `http://localhost:5173`

---

## Using the App

### First Time - Sign Up

1. Click the **"Sign Up"** tab on the login page
2. Enter your **Employee ID** (must be registered in Executive table as BUSINESS_DEVELOPMENT_EXECUTIVE)
3. Create a **password** (minimum 6 characters)
4. **Confirm password**
5. Click **"Sign Up"**

**What happens:**
- Backend checks if your employee_id exists in Executive table
- Backend verifies your role is 'BUSINESS_DEVELOPMENT_EXECUTIVE'
- If valid, account is created and you're automatically logged in
- Your details (full_name, email) are fetched from Executive table

### Returning User - Login

1. Stay on the **"Login"** tab
2. Enter your **Employee ID**
3. Enter your **Password**
4. Click **"Login"**

**What happens:**
- Backend verifies your credentials
- Updates your last_login timestamp
- Returns a JWT token for your session
- You're redirected to the Home dashboard

---

## Troubleshooting

### Backend Issues

**Problem:** npm install fails
- **Solution 1**: Run as Administrator
- **Solution 2**: Use `npm install --legacy-peer-deps`
- **Solution 3**: Install packages individually (see backend setup)

**Problem:** "Database connection failed"
- Check if database server is running
- Verify credentials in `server/.env` file
- Check if port 3971 is accessible
- Check firewall settings

**Problem:** "Port 5000 already in use"
- Change PORT in `server/.env` to 5001 or another port
- Update frontend `API_BASE_URL` in `src/pages/Login.jsx` accordingly

### Frontend Issues

**Problem:** "Failed to fetch" error on login/signup
- Ensure backend server is running on port 5000
- Check backend console for errors
- Verify `API_BASE_URL` in Login.jsx is correct

**Problem:** Blank page after starting frontend
- Check browser console for errors
- Ensure all npm packages are installed
- Try hard refresh (Ctrl + Shift + R)

### Authentication Issues

**Problem:** "Employee ID not found or not authorized"
- Your employee_id must exist in Executive table
- Your role must be 'BUSINESS_DEVELOPMENT_EXECUTIVE'
- Contact admin to check database

**Problem:** "User already registered"
- You've already signed up
- Use the Login tab instead
- Or contact admin to reset your account

**Problem:** "Invalid employee ID or password"
- Check your credentials
- Employee ID is case-sensitive
- Use Forgot Password (if implemented) or contact admin

---

## Database Configuration

The app connects to:
- **Host**: 116.202.114.156
- **Port**: 3971
- **Database**: datalake
- **User**: datalake_trw

Credentials are stored in `server/.env` file.

---

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   React App     │  HTTP   │   Express API   │  SQL    │   MySQL DB      │
│  (Port 5173)    │────────▶│  (Port 5000)    │────────▶│  (Port 3971)    │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     Frontend                    Backend                   Database
```

### Authentication Flow

```
1. User enters Employee ID + Password (Signup/Login)
   ↓
2. Frontend sends request to /api/auth/signup or /api/auth/login
   ↓
3. Backend validates against Executive table (signup) or SalesExecutiveApp_Login (login)
   ↓
4. Backend hashes password (signup) or compares hash (login)
   ↓
5. Backend generates JWT token
   ↓
6. Frontend stores token in localStorage
   ↓
7. User is logged in and redirected to Home
```

---

## Security Notes

✅ **Passwords are encrypted** using bcrypt
✅ **JWT tokens** for secure session management
✅ **Role-based access** (only BDE can signup)
✅ **SQL injection protection** via parameterized queries
✅ **Last login tracking** in database

⚠️ **Remember**: Change JWT_SECRET in production!

---

## Next Steps After Setup

1. **Test signup with a valid employee_id**
2. **Test login with created credentials**
3. **Explore the dashboard** (Home, Metrics, Earnings)
4. **Click on target cards** to navigate to detailed pages
5. **Check customer engagement sections**

---

## Project Structure

```
SalesExecutiveApp/
├── src/                          # Frontend React code
│   ├── components/               # Reusable components
│   │   ├── layout/               # Sidebar, Layout
│   │   ├── home/                 # Dashboard cards
│   │   └── shared/               # ProgressBar, AnimatedCounter
│   ├── pages/                    # Page components
│   │   ├── Login.jsx             # Signup & Login page
│   │   ├── Home.jsx              # Main dashboard
│   │   ├── Metric1-3.jsx         # Target detail pages
│   │   ├── Earnings.jsx          # Earnings page
│   │   └── More.jsx              # Settings/More page
│   ├── hooks/                    # Custom hooks
│   │   └── usePlaceholderData.js # Data hooks
│   ├── App.jsx                   # Main app component
│   └── main.jsx                  # Entry point
│
├── server/                       # Backend Node.js code
│   ├── .env                      # Environment variables (DB credentials)
│   ├── server.js                 # Express server
│   ├── db.js                     # MySQL connection
│   ├── authRoutes.js             # Authentication endpoints
│   ├── schema.sql                # Database schema
│   ├── package.json              # Backend dependencies
│   └── README.md                 # Backend documentation
│
├── public/                       # Static assets
├── package.json                  # Frontend dependencies
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config
├── CLAUDE.md                     # Developer documentation
├── SETUP_GUIDE.md                # This file
└── README.md                     # Project overview
```

---

## Support

If you encounter issues:

1. Check this guide first
2. Read [server/README.md](server/README.md) for backend details
3. Read [CLAUDE.md](CLAUDE.md) for developer docs
4. Check browser console for frontend errors
5. Check terminal for backend errors

---

## Important URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Login API**: http://localhost:5000/api/auth/login
- **Signup API**: http://localhost:5000/api/auth/signup

---

## Running Both Servers

**Quick Commands (2 terminals needed):**

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

Keep both running simultaneously!

---

Happy Selling! 🚀
