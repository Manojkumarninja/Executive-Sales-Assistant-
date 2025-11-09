// Backend Server with MySQL Database Connection
// Using child_process to execute mysql commands (no npm packages needed!)

const http = require('http');
const { exec } = require('child_process');
const crypto = require('crypto');

const PORT = 5000;

// Database configuration
const DB_CONFIG = {
  host: '116.202.114.156',
  port: '3971',
  user: 'datalake_trw',
  password: 'Tedd@13332!wq23',
  database: 'datalake'
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Simple password hash (basic - use bcrypt in production)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'SALT').digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Execute MySQL query
function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const mysqlCmd = `mysql -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} -p${DB_CONFIG.password} ${DB_CONFIG.database} -e "${query.replace(/"/g, '\\"')}" -s -N`;

    exec(mysqlCmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error('MySQL Error:', stderr || error.message);
        reject(new Error('Database query failed: ' + (stderr || error.message)));
        return;
      }

      // Parse output
      const rows = stdout.trim().split('\n').filter(line => line.trim());
      const results = rows.map(row => {
        const values = row.split('\t');
        return values;
      });

      resolve(results);
    });
  });
}

// Handle requests
const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;

  // Health check
  if (pathname === '/api/health' && req.method === 'GET') {
    executeQuery('SELECT 1')
      .then(() => {
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          message: 'Sales Executive App API is running with database!',
          timestamp: new Date().toISOString()
        }));
      })
      .catch(err => {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          message: 'Database connection failed',
          error: err.message
        }));
      });
    return;
  }

  // Get request body
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      // Signup endpoint
      if (pathname === '/api/auth/signup' && req.method === 'POST') {
        const data = JSON.parse(body);
        const { employee_id, password } = data;

        console.log('\n📝 Signup request for:', employee_id);

        // Validate inputs
        if (!employee_id || !password) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'All fields are required'
          }));
          return;
        }

        // Step 1: Check if employee exists in Executive table with correct role
        console.log('🔍 Checking Executive table...');
        const executiveQuery = `SELECT employee_id, full_name, email, role FROM Executive WHERE employee_id = '${employee_id.replace(/'/g, "\\'")}' AND role = 'BUSINESS_DEVELOPMENT_EXECUTIVE'`;

        let executiveRows;
        try {
          executiveRows = await executeQuery(executiveQuery);
        } catch (err) {
          console.error('❌ Executive query failed:', err.message);
          res.writeHead(500, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Database error while checking employee',
            error: err.message
          }));
          return;
        }

        if (executiveRows.length === 0) {
          console.log('❌ Employee not found or not authorized');
          res.writeHead(403, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Employee ID not found or not authorized. Only Business Development Executives can register.'
          }));
          return;
        }

        const [exec_id, full_name, email, role] = executiveRows[0];
        console.log('✅ Employee found:', full_name, '-', role);

        // Step 2: Check if already registered
        console.log('🔍 Checking if already registered...');
        const existingQuery = `SELECT employee_id FROM SalesExecutiveApp_Login WHERE employee_id = '${employee_id.replace(/'/g, "\\'")}'`;

        let existingRows;
        try {
          existingRows = await executeQuery(existingQuery);
        } catch (err) {
          console.error('❌ Existing user check failed:', err.message);
          res.writeHead(500, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Database error while checking registration',
            error: err.message
          }));
          return;
        }

        if (existingRows.length > 0 && existingRows[0][0]) {
          console.log('❌ User already registered');
          res.writeHead(409, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'User already registered. Please login.'
          }));
          return;
        }

        // Step 3: Hash password and insert into SalesExecutiveApp_Login
        console.log('🔐 Hashing password...');
        const hashedPassword = hashPassword(password);

        console.log('💾 Inserting into SalesExecutiveApp_Login...');
        const insertQuery = `INSERT INTO SalesExecutiveApp_Login (employee_id, password, full_name, email, role, created_at, last_login) VALUES ('${employee_id.replace(/'/g, "\\'")}', '${hashedPassword}', '${full_name.replace(/'/g, "\\'")}', '${email.replace(/'/g, "\\'")}', '${role}', NOW(), NOW())`;

        try {
          await executeQuery(insertQuery);
          console.log('✅ User registered successfully in database!');
        } catch (err) {
          console.error('❌ Insert failed:', err.message);
          res.writeHead(500, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Failed to create user account',
            error: err.message
          }));
          return;
        }

        // Success response
        res.writeHead(201, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          message: 'Signup successful!',
          token: 'token-' + employee_id + '-' + Date.now(),
          user: {
            employee_id: employee_id,
            full_name: full_name,
            email: email,
            role: role
          }
        }));
        return;
      }

      // Login endpoint
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const data = JSON.parse(body);
        const { employee_id, password } = data;

        console.log('\n🔑 Login request for:', employee_id);

        // Validate inputs
        if (!employee_id || !password) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Employee ID and password are required'
          }));
          return;
        }

        // Get user from database
        console.log('🔍 Fetching user from database...');
        const userQuery = `SELECT employee_id, password, full_name, email, role FROM SalesExecutiveApp_Login WHERE employee_id = '${employee_id.replace(/'/g, "\\'")}'`;

        let userRows;
        try {
          userRows = await executeQuery(userQuery);
        } catch (err) {
          console.error('❌ User query failed:', err.message);
          res.writeHead(500, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Database error',
            error: err.message
          }));
          return;
        }

        if (userRows.length === 0) {
          console.log('❌ User not found');
          res.writeHead(401, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid employee ID or password'
          }));
          return;
        }

        const [user_id, stored_hash, full_name, email, role] = userRows[0];

        // Verify password
        console.log('🔐 Verifying password...');
        if (!verifyPassword(password, stored_hash)) {
          console.log('❌ Invalid password');
          res.writeHead(401, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid employee ID or password'
          }));
          return;
        }

        // Update last login
        console.log('📝 Updating last login...');
        const updateQuery = `UPDATE SalesExecutiveApp_Login SET last_login = NOW() WHERE employee_id = '${employee_id.replace(/'/g, "\\'")}'`;
        try {
          await executeQuery(updateQuery);
        } catch (err) {
          console.warn('⚠️  Failed to update last login:', err.message);
        }

        console.log('✅ Login successful!');

        // Success response
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          message: 'Login successful!',
          token: 'token-' + employee_id + '-' + Date.now(),
          user: {
            employee_id: user_id,
            full_name: full_name,
            email: email,
            role: role,
            last_login: new Date()
          }
        }));
        return;
      }

      // Not found
      res.writeHead(404, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        message: 'Endpoint not found'
      }));

    } catch (error) {
      console.error('❌ Error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        message: 'Server error',
        error: error.message
      }));
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 SALES EXECUTIVE APP - DATABASE SERVER RUNNING!');
  console.log('='.repeat(70));
  console.log(`📊 Server URL: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Database: ${DB_CONFIG.database} @ ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log('\n✨ Features:');
  console.log('   ✅ Validates against Executive table');
  console.log('   ✅ Only allows BUSINESS_DEVELOPMENT_EXECUTIVE role');
  console.log('   ✅ Stores data in SalesExecutiveApp_Login table');
  console.log('   ✅ Password hashing with SHA-256');
  console.log('   ✅ Login with database verification');
  console.log('='.repeat(70) + '\n');

  // Test database connection
  console.log('🔍 Testing database connection...\n');
  executeQuery('SELECT COUNT(*) FROM Executive')
    .then(result => {
      console.log(`✅ Database connected! Found ${result[0][0]} executives in database\n`);
    })
    .catch(err => {
      console.error('❌ Database connection failed:', err.message);
      console.log('⚠️  Make sure mysql client is installed and accessible\n');
    });
});
