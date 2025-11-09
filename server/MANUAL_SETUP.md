# Manual Backend Setup Guide

Since npm install is failing on your Windows system, here's how to set everything up manually.

## Step 1: Install Node.js Packages Manually

Open **PowerShell as Administrator** and try these approaches:

### Option A: Install with --force
```powershell
cd "c:\Users\NC24028_Manojkumar M\SalesExecutiveApp\server"
npm install --force
```

### Option B: Install packages one by one
```powershell
cd "c:\Users\NC24028_Manojkumar M\SalesExecutiveApp\server"
npm install express --save
npm install mysql2 --save
npm install bcrypt --save
npm install cors --save
npm install dotenv --save
npm install jsonwebtoken --save
npm install nodemailer --save
npm install nodemon --save-dev
```

### Option C: Use Yarn (if npm fails completely)
```powershell
# Install Yarn globally first
npm install -g yarn

# Then use yarn instead
cd "c:\Users\NC24028_Manojkumar M\SalesExecutiveApp\server"
yarn install
```

### Option D: Delete node_modules and try again
```powershell
cd "c:\Users\NC24028_Manojkumar M\SalesExecutiveApp\server"
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install
```

## Step 2: Configure Email for Password Reset

Update the `.env` file with your email credentials:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

### For Gmail:
1. Go to Google Account: https://myaccount.google.com/
2. Select **Security**
3. Enable **2-Step Verification** (if not already enabled)
4. Go to **App Passwords**: https://myaccount.google.com/apppasswords
5. Generate a new App Password for "Mail"
6. Copy the 16-character password
7. Paste it in `.env` as `EMAIL_PASSWORD`

**Important**: Do NOT use your regular Gmail password. Use the App Password!

### For Other Email Providers:

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

**Yahoo:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

## Step 3: Update Database Schema

Connect to your MySQL database and run this SQL:

```sql
-- Add password reset columns to existing table
ALTER TABLE SalesExecutiveApp_Login
ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN reset_token_expiry DATETIME DEFAULT NULL,
ADD INDEX idx_reset_token (reset_token);
```

OR if the table doesn't exist yet, create it:

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
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_email (email),
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Step 4: Start the Backend Server

```powershell
cd "c:\Users\NC24028_Manojkumar M\SalesExecutiveApp\server"
node server.js
```

OR with nodemon for auto-reload:
```powershell
npm run dev
```

You should see:
```
✅ Database connected successfully!
🚀 Server is running on http://localhost:5000
📊 API endpoints available at http://localhost:5000/api
```

## Step 5: Test the Backend

Open browser and visit: http://localhost:5000/api/health

You should see:
```json
{
  "success": true,
  "message": "Sales Executive App API is running!",
  "timestamp": "2025-10-23T..."
}
```

## Troubleshooting Common Issues

### Issue: "Failed to fetch" error in frontend

**Solution:**
1. Make sure backend server is running on port 5000
2. Check browser console for specific error
3. Verify `API_BASE_URL` in Login.jsx is `http://localhost:5000/api`
4. Check CORS is enabled in backend server.js

### Issue: "Database connection failed"

**Solution:**
1. Verify database credentials in `.env` file
2. Check if database server is accessible
3. Test connection manually using MySQL client:
   ```powershell
   mysql -h 116.202.114.156 -P 3971 -u datalake_trw -p
   ```
4. Ensure port 3971 is not blocked by firewall

### Issue: "Employee ID not found or not authorized"

**Solution:**
1. Check if employee_id exists in `Executive` table
2. Verify role is exactly `'BUSINESS_DEVELOPMENT_EXECUTIVE'` (case-sensitive)
3. Run this query to check:
   ```sql
   SELECT employee_id, role FROM Executive WHERE employee_id = 'YOUR_EMP_ID';
   ```

### Issue: "nodemailer error" or email not sending

**Solution:**
1. Verify email credentials in `.env`
2. For Gmail, make sure you're using App Password (not regular password)
3. Check if 2-Step Verification is enabled (required for App Passwords)
4. Try sending a test email:
   ```javascript
   // Test script
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransporter({
     host: 'smtp.gmail.com',
     port: 587,
     auth: {
       user: 'your-email@gmail.com',
       pass: 'your-app-password'
     }
   });
   transporter.verify((error, success) => {
     if (error) console.log(error);
     else console.log('Server is ready!');
   });
   ```

### Issue: Port 5000 already in use

**Solution:**
1. Find process using port 5000:
   ```powershell
   netstat -ano | findstr :5000
   ```
2. Kill the process:
   ```powershell
   taskkill /PID <process-id> /F
   ```
OR change port in `.env`:
   ```env
   PORT=5001
   ```
   And update frontend `API_BASE_URL` to `http://localhost:5001/api`

## Testing the Complete Flow

### 1. Test Signup

**Method:** POST
**URL:** http://localhost:5000/api/auth/signup
**Body (JSON):**
```json
{
  "employee_id": "SNC1063",
  "password": "Test@123",
  "full_name": "Test User",
  "email": "test@company.com"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Signup successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "employee_id": "SNC1063",
    "full_name": "Fetched from Executive table",
    "email": "Fetched from Executive table",
    "role": "BUSINESS_DEVELOPMENT_EXECUTIVE"
  }
}
```

### 2. Test Login

**Method:** POST
**URL:** http://localhost:5000/api/auth/login
**Body (JSON):**
```json
{
  "employee_id": "SNC1063",
  "password": "Test@123"
}
```

### 3. Test Forgot Password

**Method:** POST
**URL:** http://localhost:5000/api/auth/forgot-password
**Body (JSON):**
```json
{
  "employee_id": "SNC1063"
}
```

**Expected:** Email sent to employee's registered email address

### 4. Test Reset Password

**Method:** POST
**URL:** http://localhost:5000/api/auth/reset-password
**Body (JSON):**
```json
{
  "employee_id": "SNC1063",
  "token": "token-from-email-link",
  "new_password": "NewPassword@123"
}
```

## Quick Checklist

- [ ] Node.js packages installed
- [ ] `.env` file configured with database credentials
- [ ] `.env` file configured with email credentials
- [ ] Database table `SalesExecutiveApp_Login` created
- [ ] Reset token columns added to table
- [ ] Backend server starts without errors
- [ ] Database connection successful
- [ ] Health check endpoint responds
- [ ] Can signup with valid employee_id
- [ ] Can login with created credentials
- [ ] Forgot password sends email
- [ ] Reset password works with token

## Need Help?

1. Check server logs for detailed error messages
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure database is accessible
5. Test email configuration separately

---

Once everything is working, you can start the frontend with `npm run dev` from the main project directory!
