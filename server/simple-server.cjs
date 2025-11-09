// Simplified Backend Server - No npm install needed!
// This uses only Node.js built-in modules

const http = require('http');
const url = require('url');
const { URL } = require('url');

const PORT = 5000;

// Mock database for testing (replace with real MySQL connection later)
const users = new Map();

// Simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Simple password hash (use bcrypt in production!)
function simpleHash(password) {
  return Buffer.from(password).toString('base64');
}

function simpleCompare(password, hash) {
  return Buffer.from(password).toString('base64') === hash;
}

// Handle requests
const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Health check
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      success: true,
      message: 'Sales Executive App API is running!',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Get request body
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      // Signup endpoint
      if (pathname === '/api/auth/signup' && req.method === 'POST') {
        const data = JSON.parse(body);
        const { employee_id, password } = data;

        // Validate
        if (!employee_id || !password) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Employee ID and password are required'
          }));
          return;
        }

        // Check if already registered
        if (users.has(employee_id)) {
          res.writeHead(409, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'User already registered. Please login.'
          }));
          return;
        }

        // Create user
        const hashedPassword = simpleHash(password);
        users.set(employee_id, {
          employee_id,
          password: hashedPassword,
          full_name: 'Test User',
          email: employee_id + '@company.com',
          role: 'BUSINESS_DEVELOPMENT_EXECUTIVE',
          created_at: new Date()
        });

        console.log('✅ User registered:', employee_id);

        res.writeHead(201, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          message: 'Signup successful!',
          token: 'test-token-' + employee_id,
          user: {
            employee_id,
            full_name: 'Test User',
            email: employee_id + '@company.com',
            role: 'BUSINESS_DEVELOPMENT_EXECUTIVE'
          }
        }));
        return;
      }

      // Login endpoint
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const data = JSON.parse(body);
        const { employee_id, password } = data;

        // Validate
        if (!employee_id || !password) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Employee ID and password are required'
          }));
          return;
        }

        // Check user exists
        const user = users.get(employee_id);
        if (!user) {
          res.writeHead(401, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid employee ID or password'
          }));
          return;
        }

        // Verify password
        if (!simpleCompare(password, user.password)) {
          res.writeHead(401, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid employee ID or password'
          }));
          return;
        }

        console.log('✅ User logged in:', employee_id);

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          message: 'Login successful!',
          token: 'test-token-' + employee_id,
          user: {
            employee_id: user.employee_id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            last_login: new Date()
          }
        }));
        return;
      }

      // Forgot password endpoint
      if (pathname === '/api/auth/forgot-password' && req.method === 'POST') {
        const data = JSON.parse(body);
        const { employee_id } = data;

        console.log('📧 Password reset requested for:', employee_id);

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          message: 'Password reset email sent successfully. (Demo mode - check console)'
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
      console.error('Error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        message: 'Server error',
        error: error.message
      }));
    }
  });
});

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SIMPLE BACKEND SERVER RUNNING!');
  console.log('='.repeat(60));
  console.log(`📊 Server URL: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('\n✨ Features:');
  console.log('   • Signup: POST /api/auth/signup');
  console.log('   • Login:  POST /api/auth/login');
  console.log('\n⚠️  NOTE: This is a simplified version for testing.');
  console.log('   Data is stored in memory (not database yet).');
  console.log('='.repeat(60) + '\n');
});
