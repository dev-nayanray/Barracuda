/**
 * Public Settings Routes
 * Exposes non-sensitive settings to the frontend (no auth required)
 */

const express = require('express');
const router = express.Router();
const adminStore = require('../data/adminStore');

/**
 * @route   GET /api/settings
 * @desc    Get public settings for frontend
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    const settings = adminStore.getSettings();
    
    // Return only public-facing settings
    res.json({
      success: true,
      data: {
        siteName: settings.siteName,
        companyName: settings.companyName,
        contactEmail: settings.contactEmail,
        social: settings.social,
        telegramUsername: settings.telegramUsername
      }
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching settings'
    });
  }
});

module.exports = router;

