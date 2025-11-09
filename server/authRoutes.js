import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import pool from './db.js';

const router = express.Router();

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
  const { employee_id, password, full_name, email } = req.body;

  try {
    // Validate required fields
    if (!employee_id || !password || !full_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if employee exists in Executive table with correct role
    const [executives] = await pool.query(
      'SELECT employee_id, full_name, email, role FROM Executive WHERE employee_id = ? AND role = ?',
      [employee_id, 'BUSINESS_DEVELOPMENT_EXECUTIVE']
    );

    if (executives.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Employee ID not found or not authorized. Only Business Development Executives can register.'
      });
    }

    const executive = executives[0];

    // Check if user already registered
    const [existingUsers] = await pool.query(
      'SELECT employee_id FROM SalesExecutiveApp_Login WHERE employee_id = ?',
      [employee_id]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User already registered. Please login.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into SalesExecutiveApp_Login table
    const [result] = await pool.query(
      `INSERT INTO SalesExecutiveApp_Login
       (employee_id, password, full_name, email, role, created_at, last_login)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [employee_id, hashedPassword, executive.full_name, executive.email, executive.role]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        employee_id: employee_id,
        role: executive.role,
        full_name: executive.full_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Signup successful!',
      token,
      user: {
        employee_id: employee_id,
        full_name: executive.full_name,
        email: executive.email,
        role: executive.role
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { employee_id, password } = req.body;

  try {
    // Validate required fields
    if (!employee_id || !password) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and password are required'
      });
    }

    // Get user from database
    const [users] = await pool.query(
      'SELECT * FROM SalesExecutiveApp_Login WHERE employee_id = ?',
      [employee_id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid employee ID or password'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid employee ID or password'
      });
    }

    // Update last login time
    await pool.query(
      'UPDATE SalesExecutiveApp_Login SET last_login = NOW() WHERE employee_id = ?',
      [employee_id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        employee_id: user.employee_id,
        role: user.role,
        full_name: user.full_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        employee_id: user.employee_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        last_login: new Date()
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Verify token endpoint (optional - for checking if user is authenticated)
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get fresh user data
    const [users] = await pool.query(
      'SELECT employee_id, full_name, email, role FROM SalesExecutiveApp_Login WHERE employee_id = ?',
      [decoded.employee_id]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Forgot password - Request password reset
router.post('/forgot-password', async (req, res) => {
  const { employee_id } = req.body;

  try {
    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    // Check if user exists in SalesExecutiveApp_Login
    const [users] = await pool.query(
      'SELECT employee_id, email FROM SalesExecutiveApp_Login WHERE employee_id = ?',
      [employee_id]
    );

    if (users.length === 0) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If the employee ID exists, a password reset email has been sent.'
      });
    }

    const user = users[0];

    // Get email from Executive table
    const [executives] = await pool.query(
      'SELECT email FROM Executive WHERE employee_id = ?',
      [employee_id]
    );

    if (executives.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found in system'
      });
    }

    const executiveEmail = executives[0].email;

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await pool.query(
      `UPDATE SalesExecutiveApp_Login
       SET reset_token = ?, reset_token_expiry = ?
       WHERE employee_id = ?`,
      [resetTokenHash, resetTokenExpiry, employee_id]
    );

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&emp=${employee_id}`;

    // Email content
    const mailOptions = {
      from: `"Sales Executive App" <${process.env.EMAIL_USER}>`,
      to: executiveEmail,
      subject: 'Password Reset Request - Sales Executive App',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6C5DD3 0%, #5a4db8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #6C5DD3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${user.employee_id}</strong>,</p>
              <p>We received a request to reset your password for the Sales Executive App. Click the button below to create a new password:</p>

              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                ${resetUrl}
              </p>

              <div class="warning">
                <p><strong>⚠️ Important:</strong></p>
                <ul>
                  <li>This link will expire in <strong>1 hour</strong></li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>

              <p>For security, this password reset link can only be used once.</p>

              <p>Best regards,<br><strong>Sales Executive App Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; 2025 Sales Executive App. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully. Please check your email.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
});

// Reset password - Verify token and update password
router.post('/reset-password', async (req, res) => {
  const { employee_id, token, new_password } = req.body;

  try {
    if (!employee_id || !token || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, token, and new password are required'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash the provided token
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Get user with valid reset token
    const [users] = await pool.query(
      `SELECT employee_id, reset_token, reset_token_expiry
       FROM SalesExecutiveApp_Login
       WHERE employee_id = ? AND reset_token = ? AND reset_token_expiry > NOW()`,
      [employee_id, resetTokenHash]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password and clear reset token
    await pool.query(
      `UPDATE SalesExecutiveApp_Login
       SET password = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW()
       WHERE employee_id = ?`,
      [hashedPassword, employee_id]
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

export default router;
