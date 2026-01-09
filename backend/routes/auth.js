/**
 * Admin Authentication Routes
 * Handles admin login, registration, and profile management
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const adminStore = require('../data/adminStore');
const { generateToken, authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin by email
    const admin = adminStore.getAdminByEmail(email);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(admin);

    // Update last login
    adminStore.updateAdminLogin(admin.id);

    // Return response (without password)
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new admin (super_admin only in production)
 * @access  Public (for initial setup, add auth in production)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Check if email already exists
    if (adminStore.getAdminByEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = adminStore.createAdmin({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      role: 'admin'
    });

    // Generate token
    const token = generateToken(admin);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current admin profile
 * @access  Private
 */
router.get('/me', authenticateToken, (req, res) => {
  const admin = adminStore.getAdminById(req.user.id);
  
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  res.json({
    success: true,
    data: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin
    }
  });
});

/**
 * @route   PUT /api/auth/password
 * @desc    Change admin password
 * @access  Private
 */
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    const admin = adminStore.getAdminById(req.user.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash and update new password
    admin.password = await bcrypt.hash(newPassword, 10);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing password'
    });
  }
});

/**
 * @route   GET /api/auth/admins
 * @desc    Get all admin users
 * @access  Private (super_admin only)
 */
router.get('/admins', authenticateToken, (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions'
    });
  }

  const admins = adminStore.getAllAdmins();
  
  res.json({
    success: true,
    data: admins,
    total: admins.length
  });
});

module.exports = router;

