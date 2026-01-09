  /**
 * Admin Settings Routes
 * Handles site settings management
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const adminStore = require('../../data/adminStore');

/**
 * @route   GET /api/admin/settings
 * @desc    Get all site settings
 * @access  Private
 */
router.get('/settings', authenticateToken, (req, res) => {
  const settings = adminStore.getSettings();
  
  res.json({
    success: true,
    data: settings
  });
});

/**
 * @route   PUT /api/admin/settings
 * @desc    Update site settings
 * @access  Private
 */
router.put('/settings', authenticateToken, (req, res) => {
  try {
    const allowedFields = [
      'siteName',
      'siteDescription',
      'companyName',
      'contactEmail',
      'maintenanceMode',
      'allowNewRegistrations',
      'analytics',
      'notifications',
      'social'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const settings = adminStore.updateSettings(updates);
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating settings'
    });
  }
});

/**
 * @route   GET /api/admin/settings/dashboard
 * @desc    Get dashboard overview data
 * @access  Private
 */
router.get('/settings/dashboard', authenticateToken, (req, res) => {
  try {
    // Get settings
    const settings = adminStore.getSettings();
    
    // Get stats (would come from database in production)
    const dashboardData = {
      siteInfo: {
        siteName: settings.siteName,
        companyName: settings.companyName,
        contactEmail: settings.contactEmail,
        maintenanceMode: settings.maintenanceMode
      },
      quickStats: {
        totalContacts: 0, // Will be updated from contacts
        thisMonth: 0,
        publishers: 0,
        advertisers: 0
      },
      systemHealth: {
        database: 'connected',
        api: 'operational',
        lastBackup: new Date().toISOString()
      },
      recentActivity: [
        { type: 'contact', message: 'New contact submission', time: new Date().toISOString() }
      ]
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching dashboard data'
    });
  }
});

/**
 * @route   POST /api/admin/settings/reset
 * @desc    Reset settings to defaults
 * @access  Private
 */
router.post('/settings/reset', authenticateToken, (req, res) => {
  try {
    const defaultSettings = {
      siteName: 'Affiiate',
      siteDescription: 'Premium Casino Affiliate Network',
      companyName: 'Barracuda Marketing',
      contactEmail: 'contact@affiiate.com',
      maintenanceMode: false,
      allowNewRegistrations: true,
      analytics: {
        trackingId: '',
        googleAnalytics: false
      },
      notifications: {
        emailOnNewContact: true,
        emailOnNewRegistration: true,
        dailyDigest: false
      },
      social: {
        telegram: 'https://t.me/affiiate',
        skype: 'live:affiiate',
        email: 'contact@affiiate.com'
      }
    };

    adminStore.updateSettings(defaultSettings);
    
    res.json({
      success: true,
      message: 'Settings reset to defaults',
      data: defaultSettings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting settings'
    });
  }
});

module.exports = router;

