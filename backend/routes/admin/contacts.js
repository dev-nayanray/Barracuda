/**
 * Admin Contacts Routes
 * Handles contact management for admin panel
 * Includes affiliate-specific statistics and actions
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth');

router.post('/contact', async (req, res) => {
  const { email, affiliate_id } = req.body;

  // 1. Save contact locally
  await store.saveContact({
    email,
    affiliate_id,
    source: 'affiliate'
  });

  // 2. Return redirect URL (DO NOT CALL HOOPLASEFT SERVER-SIDE)
  const redirectUrl =
    `https://hooplaseft.com/api/v3/offer/2?affiliate_id=${affiliate_id}&url_id=2`;

  res.json({
    success: true,
    redirectUrl
  });
});


/**
 * @route   GET /api/admin/contacts
 * @desc    Get all contacts with optional filtering
 * @access  Private
 */
router.get('/contacts', authenticateToken, (req, res) => {
  try {
    const { type, status, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let filteredContacts = [...store.contacts];

    // Filter by type
    if (type) {
      filteredContacts = filteredContacts.filter(c => c.type === type);
    }

    // Filter by status
    if (status) {
      filteredContacts = filteredContacts.filter(c => c.status === status);
    }

    // Filter by affiliate status
    if (req.query.affiliateStatus) {
      filteredContacts = filteredContacts.filter(c => c.affiliate_status === req.query.affiliateStatus);
    }

    // Filter by date range
    if (startDate) {
      filteredContacts = filteredContacts.filter(c => new Date(c.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filteredContacts = filteredContacts.filter(c => new Date(c.createdAt) <= new Date(endDate));
    }

    // Search by name, email, or company
    if (search) {
      const searchLower = search.toLowerCase();
      filteredContacts = filteredContacts.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.company.toLowerCase().includes(searchLower)
      );
    }

    // Sort by created date (newest first)
    filteredContacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

    // Calculate comprehensive statistics
    const stats = {
      // Basic counts
      total: store.contacts.length,
      
      // By type
      byType: {
        affiliate: store.contacts.filter(c => c.type === 'affiliate' || c.type === 'publisher').length,
        advertiser: store.contacts.filter(c => c.type === 'advertiser').length,
        influencer: store.contacts.filter(c => c.type === 'influencer').length,
        media_buyer: store.contacts.filter(c => c.type === 'media_buyer').length,
        agency: store.contacts.filter(c => c.type === 'agency').length
      },
      
      // By contact status
      byStatus: {
        new: store.contacts.filter(c => c.status === 'new').length,
        contacted: store.contacts.filter(c => c.status === 'contacted').length,
        qualified: store.contacts.filter(c => c.status === 'qualified').length,
        rejected: store.contacts.filter(c => c.status === 'rejected').length
      },
      
      // Affiliate-specific stats
      affiliateStats: {
        total: store.contacts.filter(c => c.registration_type === 'affiliate').length,
        pending: store.contacts.filter(c => c.affiliate_status === 'pending').length,
        approved: store.contacts.filter(c => c.affiliate_status === 'approved').length,
        rejected: store.contacts.filter(c => c.affiliate_status === 'rejected').length,
        registered: store.contacts.filter(c => c.affiliateRegistered === true).length,
        errors: store.contacts.filter(c => c.affiliateError).length
      },
      
      // By traffic source
      byTrafficSource: {},
      

    };

    // Calculate traffic source distribution
    store.contacts.forEach(c => {
      const source = c.traffic_source || 'unknown';
      stats.byTrafficSource[source] = (stats.byTrafficSource[source] || 0) + 1;
    });

    res.json({
      success: true,
      data: paginatedContacts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredContacts.length,
        pages: Math.ceil(filteredContacts.length / limitNum)
      },
      stats
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching contacts'
    });
  }
});

/**
 * @route   GET /api/admin/contacts/stats
 * @desc    Get contact statistics
 * @access  Private
 */
router.get('/contacts/stats', authenticateToken, (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: store.contacts.length,
      today: store.contacts.filter(c => new Date(c.createdAt) >= today).length,
      thisWeek: store.contacts.filter(c => new Date(c.createdAt) >= thisWeek).length,
      thisMonth: store.contacts.filter(c => new Date(c.createdAt) >= thisMonth).length,
      
      byType: {
        affiliate: store.contacts.filter(c => c.type === 'affiliate' || c.type === 'publisher').length,
        advertiser: store.contacts.filter(c => c.type === 'advertiser').length,
        influencer: store.contacts.filter(c => c.type === 'influencer').length,
        media_buyer: store.contacts.filter(c => c.type === 'media_buyer').length,
        agency: store.contacts.filter(c => c.type === 'agency').length
      },
      
      byStatus: {
        new: store.contacts.filter(c => c.status === 'new').length,
        contacted: store.contacts.filter(c => c.status === 'contacted').length,
        qualified: store.contacts.filter(c => c.status === 'qualified').length,
        rejected: store.contacts.filter(c => c.status === 'rejected').length
      },
      
      affiliateStats: {
        pending: store.contacts.filter(c => c.affiliate_status === 'pending').length,
        approved: store.contacts.filter(c => c.affiliate_status === 'approved').length,
        rejected: store.contacts.filter(c => c.affiliate_status === 'rejected').length,
        registered: store.contacts.filter(c => c.affiliateRegistered === true).length
      },
      
      byTrafficSource: {}
    };

    // Calculate traffic source distribution
    store.contacts.forEach(c => {
      const source = c.traffic_source || 'unknown';
      stats.byTrafficSource[source] = (stats.byTrafficSource[source] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching statistics'
    });
  }
});

/**
 * @route   GET /api/admin/contacts/:id
 * @desc    Get single contact by ID
 * @access  Private
 */
router.get('/contacts/:id', authenticateToken, (req, res) => {
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
 * @route   PUT /api/admin/contacts/:id
 * @desc    Update contact status, notes, and affiliate/Blitz data
 * @access  Private
 */
router.put('/contacts/:id', authenticateToken, (req, res) => {
  try {
    const contact = store.contacts.find(c => c.id === parseInt(req.params.id));

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    const {
      status,
      notes,
      assignedTo,
      // Affiliate-specific fields
      affiliate_status,
      affiliate_id,
      traffic_source,
      campaign_id
    } = req.body;

    // Update contact status fields
    if (status) contact.status = status;
    if (notes !== undefined) contact.notes = notes;
    if (assignedTo !== undefined) contact.assignedTo = assignedTo;

    // Update affiliate-specific fields
    if (affiliate_status !== undefined) contact.affiliate_status = affiliate_status;
    if (affiliate_id !== undefined) contact.affiliate_id = affiliate_id;
    if (traffic_source !== undefined) contact.traffic_source = traffic_source;
    if (campaign_id !== undefined) contact.campaign_id = campaign_id;

    contact.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating contact'
    });
  }
});

/**
 * @route   POST /api/admin/contacts/:id/approve-affiliate
 * @desc    Approve affiliate registration
 * @access  Private
 */
router.post('/contacts/:id/approve-affiliate', authenticateToken, async (req, res) => {
  try {
    const contact = store.contacts.find(c => c.id === parseInt(req.params.id));

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    if (contact.registration_type !== 'affiliate') {
      return res.status(400).json({
        success: false,
        message: 'This contact is not an affiliate registration'
      });
    }

    // Update affiliate status
    contact.affiliate_status = 'approved';
    contact.affiliate_approved_at = new Date().toISOString();
    contact.affiliate_approved_by = req.user?.email || 'admin';
    contact.updatedAt = new Date().toISOString();

    // TODO: Send approval email to affiliate
    // TODO: Create account in affiliate platform

    res.json({
      success: true,
      message: 'Affiliate approved successfully',
      data: contact
    });
  } catch (error) {
    console.error('Approve affiliate error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while approving affiliate'
    });
  }
});

/**
 * @route   POST /api/admin/contacts/:id/reject-affiliate
 * @desc    Reject affiliate registration
 * @access  Private
 */
router.post('/contacts/:id/reject-affiliate', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const contact = store.contacts.find(c => c.id === parseInt(req.params.id));

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    if (contact.registration_type !== 'affiliate') {
      return res.status(400).json({
        success: false,
        message: 'This contact is not an affiliate registration'
      });
    }

    // Update affiliate status
    contact.affiliate_status = 'rejected';
    contact.affiliate_rejected_at = new Date().toISOString();
    contact.affiliate_rejected_reason = reason || 'Did not meet requirements';
    contact.affiliate_rejected_by = req.user?.email || 'admin';
    contact.updatedAt = new Date().toISOString();

    // TODO: Send rejection email to affiliate

    res.json({
      success: true,
      message: 'Affiliate rejected',
      data: contact
    });
  } catch (error) {
    console.error('Reject affiliate error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while rejecting affiliate'
    });
  }
});

/**
 * @route   DELETE /api/admin/contacts/:id
 * @desc    Delete contact
 * @access  Private
 */
router.delete('/contacts/:id', authenticateToken, (req, res) => {
  const index = store.contacts.findIndex(c => c.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found'
    });
  }

  store.contacts.splice(index, 1);

  res.json({
    success: true,
    message: 'Contact deleted successfully'
  });
});

/**
 * @route   POST /api/admin/contacts/export
 * @desc    Export contacts to CSV with all fields
 * @access  Private
 */
router.post('/contacts/export', authenticateToken, (req, res) => {
  try {
    const { type, status, startDate, endDate, includeAffiliateFields = true } = req.body;
    
    let exportContacts = [...store.contacts];

    // Apply filters
    if (type) exportContacts = exportContacts.filter(c => c.type === type);
    if (status) exportContacts = exportContacts.filter(c => c.status === status);
    if (startDate) exportContacts = exportContacts.filter(c => new Date(c.createdAt) >= new Date(startDate));
    if (endDate) exportContacts = exportContacts.filter(c => new Date(c.createdAt) <= new Date(endDate));

    // Generate CSV headers
    const baseHeaders = [
      'ID', 'Name', 'Email', 'Company', 'Type', 'Messenger', 'Username', 
      'Status', 'Notes', 'Created At', 'Updated At'
    ];

    const affiliateHeaders = includeAffiliateFields ? [
      'Registration Type', 'Affiliate ID', 'Traffic Source', 'Campaign ID',
      'Affiliate Status', 'Tracking Link', 'Blitz Posted', 'FTD'
    ] : [];

    const headers = [...baseHeaders, ...affiliateHeaders];

    const csvRows = [headers.join(',')];

    exportContacts.forEach(contact => {
      const row = [
        contact.id,
        `"${contact.name}"`,
        contact.email,
        `"${contact.company}"`,
        contact.type,
        contact.messenger || '',
        contact.username || '',
        contact.status || 'new',
        contact.notes ? `"${contact.notes.replace(/"/g, '""')}"` : '',
        contact.createdAt,
        contact.updatedAt || ''
      ];

      if (includeAffiliateFields) {
        const affiliateRow = [
          contact.registration_type || '',
          contact.affiliate_id || '',
          contact.traffic_source || '',
          contact.campaign_id || '',
          contact.affiliate_status || '',
          contact.tracking_link || ''
        ];
        row.push(...affiliateRow);
      }

      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=contacts-${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while exporting contacts'
    });
  }
});

module.exports = router;

