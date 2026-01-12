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

/**
 * Generate a random password meeting Blitz requirements
 * @returns {string} Random password (6-12 chars, 1 uppercase, 1 lowercase, 1 numeric)
 */
function generateRandomPassword() {
  const length = Math.floor(Math.random() * 7) + 6; // 6-12 characters
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];

  const allChars = uppercase + lowercase + numbers;
  for (let i = 3; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check FTD (First Time Deposit) for a lead
 * @param {string} email - Lead email to check
 */
async function checkFTD(email) {
  try {
    const ftdParams = new URLSearchParams({
      token: BLITZ_TOKEN,
      from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 24 hours
      to: new Date().toISOString().split('T')[0],
      filter: 'ftd',
      limit: '200'
    });

    const ftdResponse = await axios.get(`${BLITZ_API_BASE}/affiliate_deposits/?${ftdParams}`);

    if (ftdResponse.data && Array.isArray(ftdResponse.data)) {
      const ftdFound = ftdResponse.data.some(deposit => deposit.email === email);
      if (ftdFound) {
        console.log('🎉 FTD detected for email:', email);

        // Update contact record with FTD status
        const contact = store.contacts.find(c => c.email === email);
        if (contact) {
          contact.ftd = true;
          contact.ftdDate = new Date().toISOString();
          console.log('Updated contact with FTD status:', contact.id);
        }
      }
    }
  } catch (error) {
    console.error('FTD Check failed:', error.response?.data || error.message);
  }
}

module.exports = router;

