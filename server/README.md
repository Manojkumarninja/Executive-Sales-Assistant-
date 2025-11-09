# Sales Executive App - Backend API

## Overview
This is the Node.js/Express backend API for the Sales Executive App. It handles authentication, database operations, and provides RESTful endpoints for the React frontend.

## Database Setup

### Prerequisites
- MySQL database server
- Database credentials (see `.env` file)

### Database Tables Required

#### 1. Executive Table (Should already exist)
```sql
-- This table should already contain employee data
CREATE TABLE IF NOT EXISTS Executive (
    employee_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    -- other columns as per your schema
    INDEX idx_role (role)
);
```

#### 2. SalesExecutiveApp_Login Table (Create this)
Run the following SQL to create the login table:

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

## Installation

### Step 1: Install Dependencies
If npm install is having issues on Windows, try one of these approaches:

**Option A: Run as Administrator**
```bash
# Open PowerShell or CMD as Administrator
cd server
npm install
```

**Option B: Use --legacy-peer-deps flag**
```bash
cd server
npm install --legacy-peer-deps
```

**Option C: Install packages individually**
```bash
cd server
npm install express
npm install mysql2
npm install bcrypt
npm install cors
npm install dotenv
npm install jsonwebtoken
npm install nodemon --save-dev
```

**Option D: Use Yarn (if npm fails)**
```bash
cd server
yarn install
```

### Step 2: Configure Environment Variables
The `.env` file already contains the database credentials:

```env
DB_HOST=116.202.114.156
DB_USER=datalake_trw
DB_PASSWORD=Tedd@13332!wq23
DB_PORT=3971
DB_NAME=datalake
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this_in_production_12345
```

**IMPORTANT**: Change the `JWT_SECRET` before deploying to production!

### Step 3: Test Database Connection
Before starting the server, ensure you can connect to the database:

```bash
cd server
node -e "import('./db.js')"
```

You should see: `✅ Database connected successfully!`

## Running the Server

### Development Mode (with auto-reload)
```bash
cd server
npm run dev
```

### Production Mode
```bash
cd server
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status

**Response:**
```json
{
  "success": true,
  "message": "Sales Executive App API is running!",
  "timestamp": "2025-10-23T11:00:00.000Z"
}
```

### Signup
```
POST /api/auth/signup
```

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "password": "password123",
  "full_name": "John Doe",
  "email": "john@company.com"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Signup successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "employee_id": "EMP001",
    "full_name": "John Doe",
    "email": "john@company.com",
    "role": "BUSINESS_DEVELOPMENT_EXECUTIVE"
  }
}
```

**Error Responses:**
- 400: Missing required fields
- 403: Employee not found or not authorized (not a Business Development Executive)
- 409: User already registered
- 500: Server error

### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "employee_id": "EMP001",
    "full_name": "John Doe",
    "email": "john@company.com",
    "role": "BUSINESS_DEVELOPMENT_EXECUTIVE",
    "last_login": "2025-10-23T11:00:00.000Z"
  }
}
```

**Error Responses:**
- 400: Missing required fields
- 401: Invalid credentials
- 500: Server error

### Verify Token
```
GET /api/auth/verify
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "employee_id": "EMP001",
    "full_name": "John Doe",
    "email": "john@company.com",
    "role": "BUSINESS_DEVELOPMENT_EXECUTIVE"
  }
}
```

## Authentication Flow

### Signup Process
1. User enters employee_id and password
2. Backend validates employee exists in `Executive` table
3. Backend checks role is 'BUSINESS_DEVELOPMENT_EXECUTIVE'
4. Password is hashed using bcrypt
5. User record is created in `SalesExecutiveApp_Login` table
6. JWT token is generated and returned
7. Frontend stores token in localStorage
8. User is automatically logged in

### Login Process
1. User enters employee_id and password
2. Backend fetches user from `SalesExecutiveApp_Login` table
3. Password is verified using bcrypt
4. `last_login` timestamp is updated
5. JWT token is generated and returned
6. Frontend stores token in localStorage
7. User is redirected to home page

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds = 10
- **JWT Tokens**: Secure JSON Web Tokens for session management (24-hour expiry)
- **Role-Based Access**: Only Business Development Executives can sign up
- **SQL Injection Protection**: Using parameterized queries via mysql2
- **CORS Enabled**: For frontend-backend communication
- **Input Validation**: Server-side validation of all inputs

## Troubleshooting

### Issue: npm install fails
**Solution**: Try running as Administrator, or use `--legacy-peer-deps`, or install packages individually

### Issue: Database connection fails
**Solutions**:
- Check if database server is accessible
- Verify credentials in `.env` file
- Check firewall settings
- Ensure port 3971 is open

### Issue: "Cannot find module 'express'"
**Solution**: Run `npm install` or install express manually: `npm install express`

### Issue: Port 5000 already in use
**Solution**: Change PORT in `.env` file to a different port (e.g., 5001, 5002)

### Issue: CORS errors in frontend
**Solution**: Ensure the backend CORS is configured to allow requests from your frontend origin

## File Structure

```
server/
├── .env                  # Environment variables (database credentials)
├── package.json          # Dependencies and scripts
├── server.js             # Main Express server
├── db.js                 # Database connection pool
├── authRoutes.js         # Authentication endpoints
├── schema.sql            # Database schema
└── README.md             # This file
```

## Next Steps

1. **Install dependencies** (if not done yet)
2. **Create the SalesExecutiveApp_Login table** in the database
3. **Start the backend server**
4. **Test the endpoints** using Postman or the frontend
5. **Verify signup and login flows** work correctly

## Testing with Postman

### Test Signup
1. POST to `http://localhost:5000/api/auth/signup`
2. Body (JSON):
```json
{
  "employee_id": "test_emp_001",
  "password": "Test@123",
  "full_name": "Test User",
  "email": "test@company.com"
}
```

### Test Login
1. POST to `http://localhost:5000/api/auth/login`
2. Body (JSON):
```json
{
  "employee_id": "test_emp_001",
  "password": "Test@123"
}
```

## Production Considerations

Before deploying to production:

1. ✅ Change `JWT_SECRET` to a secure random string
2. ✅ Use HTTPS for all API requests
3. ✅ Set up proper error logging
4. ✅ Implement rate limiting
5. ✅ Add request validation middleware
6. ✅ Set up database connection pooling (already configured)
7. ✅ Use environment-specific `.env` files
8. ✅ Add API documentation (Swagger/OpenAPI)
9. ✅ Implement refresh tokens for longer sessions
10. ✅ Add password reset functionality

## Support

For issues or questions, please contact the development team.
