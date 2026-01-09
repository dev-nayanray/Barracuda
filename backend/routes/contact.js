/**
 * Contact Form Routes
 * Handles contact form submissions from the frontend
 */

const express = require('express');
const router = express.Router();

// Use shared data store
const store = require('../data/store');

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, company, type, messenger, message, username } = req.body;

    // Validation
    if (!name || !email || !company || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create contact record
    const contact = {
      id: store.contacts.length + 1,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      company: company.trim(),
      type, // 'publisher' or 'advertiser'
      messenger: messenger || null,
      username: username || null,
      message: message?.trim() || null,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    // Store contact in shared store
    store.contacts.push(contact);

    // Log contact (in production, send email notification)
    console.log('📬 New Contact Submission:', contact);

    // Simulate email sending (replace with actual email service)
    // await sendEmailNotification(contact);

    res.status(201).json({
      success: true,
      message: 'Thank you for your interest! Our team will contact you within 24 hours.',
      data: {
        contactId: contact.id,
        submittedAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your request. Please try again.'
    });
  }
});

/**
 * @route   GET /api/contact
 * @desc    Get all contacts (admin only - add authentication in production)
 * @access  Private
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: store.contacts,
    total: store.contacts.length
  });
});

/**
 * @route   GET /api/contact/:id
 * @desc    Get single contact by ID
 * @access  Private
 */
router.get('/:id', (req, res) => {
  const contact = store.contacts.find(c => c.id === parseInt(req.params.id));
  
  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found'
    });
  }

  res.json({
    success: true,
    data: contact
  });
});

module.exports = router;

