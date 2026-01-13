/**
 * Contact Form Routes - Barracuda/iREV Integration
 * Handles contact form submissions with affiliate registration
 * 
 * Endpoints:
 * - POST /api/contact - Submit form and register affiliate
 * - GET /api/contact - Get all contacts (admin)
 * - POST /api/contact/tracking-link - Generate tracking link
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Use shared data store
const store = require('../data/store');

// Hooplaseft Affiliate Platform Configuration
const HOOPLASEFT_API_BASE = 'https://hooplaseft.com/api/v3';
const HOOPLASEFT_API_KEY = process.env.HOOPLASEFT_API_KEY || '';
const HOOPLASEFT_DEFAULT_AFFILIATE_ID = '2';
const HOOPLASEFT_URL_ID = '2'; // Always 2 as per requirements

/**
 * @route   POST /api/contact
 * @desc    Submit contact form (general or affiliate registration)
 * @access  Public
 * 
 * Process:
 * 1. Validate form data
 * 2. Store contact locally for record keeping
 * 3. Submit lead to Hooplaseft iREV Offer API (POST /api/v3/offer/2)
 * 4. Return tracking link and status
 */
router.post('/', async (req, res) => {
  try {
    const formData = req.body;
    const {
      name,
      email,
      company,
      type,
      messenger,
      username,
      message,
      // URL parameters captured
      affiliate_id,
      url_id,
      sub1,
      // Tracking fields
      trackingSource,
      campaignId
    } = formData;

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

    // Determine registration type
    const registrationType = type === 'affiliate' || type === 'publisher' ? 'affiliate' : 
                             type === 'advertiser' ? 'advertiser' : 'other';

    // Use URL parameters or defaults
    const effectiveAffiliateId = affiliate_id || HOOPLASEFT_DEFAULT_AFFILIATE_ID;
    const effectiveUrlId = url_id || HOOPLASEFT_URL_ID;
    
    // Generate tracking link for affiliate registrations
    let trackingLink = null;
    if (registrationType === 'affiliate') {
      const trackingParams = new URLSearchParams({
        affiliate_id: effectiveAffiliateId,
        url_id: effectiveUrlId,
        source: trackingSource || 'contact_form'
      });
      
      // Add optional sub1 (click ID) if present
      if (sub1) {
        trackingParams.append('sub1', sub1);
      }
      
      // Add optional user info for pre-fill
      if (name) trackingParams.append('name', encodeURIComponent(name));
      if (email) trackingParams.append('email', encodeURIComponent(email));
      if (company) trackingParams.append('company', encodeURIComponent(company));
      
      trackingLink = `${HOOPLASEFT_API_BASE}/offer/${effectiveUrlId}?${trackingParams.toString()}`;
    }

    // Create contact record with all fields
    const contact = {
      id: store.contacts.length + 1,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      company: company.trim(),
      type, // 'affiliate', 'publisher', 'advertiser', 'influencer', 'media_buyer', 'agency'
      messenger: messenger || null,
      username: username || null,
      message: message?.trim() || null,
      status: 'new',
      
      // Affiliate-specific fields
      affiliate_id: effectiveAffiliateId,
      url_id: effectiveUrlId,
      sub1: sub1 || null,
      traffic_source: trackingSource || null,
      campaign_id: campaignId || null,
      registration_type: registrationType,
      affiliate_status: registrationType === 'affiliate' ? 'pending' : null,
      tracking_link: trackingLink,
      registration_date: new Date().toISOString(),
      
      createdAt: new Date().toISOString()
    };

    // Store contact in shared store
    store.contacts.push(contact);

    // Log contact
    console.log('📬 New Contact Submission:', {
      id: contact.id,
      type: registrationType,
      email: contact.email,
      affiliate_id: effectiveAffiliateId,
      sub1: sub1 || 'not set'
    });

    // Process Hooplaseft Affiliate Registration
    // POST https://hooplaseft.com/api/v3/offer/2
    let affiliatePosted = false;
    let affiliateError = null;

    if (registrationType === 'affiliate') {
      try {
        console.log('🚀 Registering affiliate in hooplaseft platform...');
        
        // Build the offer submission payload
        const affiliateData = {
          // Required fields per specification
          affiliate_id: effectiveAffiliateId,
          url_id: effectiveUrlId, // Always 2
          name: name.trim(),
          email: email.toLowerCase().trim(),
          company: company.trim(),
          messenger: messenger || '',
          username: username || '',
          message: message?.trim() || '',
          
          // Optional tracking fields
          sub1: sub1 || '', // Click ID
          source: trackingSource || 'contact_form',
          campaign_id: campaignId || '',
          
          // Metadata
          registration_date: new Date().toISOString(),
          status: 'pending',
          source_url: req.headers.referer || 'contact_form',
          ip_address: req.ip || req.connection.remoteAddress || '127.0.0.1'
        };

        // Call hooplaseft offer API endpoint
        const affiliateResponse = await axios.post(
          `${HOOPLASEFT_API_BASE}/offer/${effectiveUrlId}`,
          affiliateData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': HOOPLASEFT_API_KEY ? `Bearer ${HOOPLASEFT_API_KEY}` : ''
            },
            timeout: 15000 // 15 second timeout
          }
        );

        console.log('✅ Affiliate registered successfully:', affiliateResponse.data);
        affiliatePosted = true;
        contact.affiliateRegistered = true;
        contact.affiliateResponse = affiliateResponse.data;

      } catch (affiliateApiError) {
        console.error('❌ Hooplaseft API Error:', affiliateApiError.response?.data || affiliateApiError.message);
        
        // Don't fail the whole request if affiliate registration fails
        // The contact is still stored locally
        if (affiliateApiError.response) {
          affiliateError = affiliateApiError.response.data?.message || 
                          affiliateApiError.response.statusText || 
                          'API request failed';
        } else if (affiliateApiError.request) {
          affiliateError = 'No response from Hooplaseft API';
        } else {
          affiliateError = affiliateApiError.message;
        }
        
        contact.affiliateError = affiliateError;
        contact.affiliateRegistered = false;
      }
    }

    // Send success response
    res.status(201).json({
      success: true,
      message: registrationType === 'affiliate' 
        ? 'Your affiliate application has been submitted successfully! Our team will contact you within 24 hours.'
        : 'Thank you for your interest! Our team will contact you within 24 hours.',
      data: {
        contactId: contact.id,
        submittedAt: contact.createdAt,
        registrationType,
        affiliatePosted: registrationType === 'affiliate' ? affiliatePosted : null,
        affiliateError: registrationType === 'affiliate' ? affiliateError : null,
        trackingLink: trackingLink,
        // Tracking parameters for dashboard
        tracking: {
          affiliate_id: effectiveAffiliateId,
          url_id: effectiveUrlId,
          sub1: sub1 || null,
          source: trackingSource || 'contact_form'
        }
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
 * @route   POST /api/contact/tracking-link
 * @desc    Generate tracking link for affiliate
 * @access  Public
 */
router.post('/tracking-link', (req, res) => {
  try {
    const { affiliateId, urlId, sub1, source, name, email, company } = req.body;
    
    const effectiveAffiliateId = affiliateId || HOOPLASEFT_DEFAULT_AFFILIATE_ID;
    const effectiveUrlId = urlId || HOOPLASEFT_URL_ID;
    
    const trackingParams = new URLSearchParams({
      affiliate_id: effectiveAffiliateId,
      url_id: effectiveUrlId,
      source: source || 'contact_form'
    });

    // Add optional sub1 (click ID)
    if (sub1) {
      trackingParams.append('sub1', sub1);
    }

    // Add optional parameters if provided
    if (name) trackingParams.append('name', encodeURIComponent(name));
    if (email) trackingParams.append('email', encodeURIComponent(email));
    if (company) trackingParams.append('company', encodeURIComponent(company));

    const trackingLink = `${HOOPLASEFT_API_BASE}/offer/${effectiveUrlId}?${trackingParams.toString()}`;

    res.json({
      success: true,
      data: {
        trackingLink,
        affiliateId: effectiveAffiliateId,
        urlId: effectiveUrlId,
        sub1: sub1 || null,
        source: source || 'contact_form'
      }
    });
  } catch (error) {
    console.error('Tracking link generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate tracking link'
    });
  }
});

/**
 * @route   POST /api/contact/verify
 * @desc    Verify if email exists in system
 * @access  Public
 */
router.post('/verify', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Search contacts for this email
    const existingContact = store.contacts.find(
      c => c.email === email.toLowerCase().trim()
    );

    if (existingContact) {
      res.json({
        success: true,
        data: {
          exists: true,
          contact: existingContact,
          affiliateStatus: existingContact.affiliate_status,
          registrationDate: existingContact.registration_date
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          exists: false
        }
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email'
    });
  }
});

module.exports = router;

