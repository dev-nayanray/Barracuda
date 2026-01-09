/**
 * Admin Contacts Routes
 * Handles contact management for admin panel
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth');

// Use shared data store
const store = require('../../data/store');

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

    // Calculate statistics
    const stats = {
      total: store.contacts.length,
      publishers: store.contacts.filter(c => c.type === 'publisher').length,
      advertisers: store.contacts.filter(c => c.type === 'advertiser').length,
      new: store.contacts.filter(c => c.status === 'new').length,
      contacted: store.contacts.filter(c => c.status === 'contacted').length,
      qualified: store.contacts.filter(c => c.status === 'qualified').length
    };

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
        publisher: store.contacts.filter(c => c.type === 'publisher').length,
        advertiser: store.contacts.filter(c => c.type === 'advertiser').length
      },
      byStatus: {
        new: store.contacts.filter(c => c.status === 'new').length,
        contacted: store.contacts.filter(c => c.status === 'contacted').length,
        qualified: store.contacts.filter(c => c.status === 'qualified').length,
        rejected: store.contacts.filter(c => c.status === 'rejected').length
      }
    };

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
 * @desc    Update contact status and notes
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

    const { status, notes, assignedTo } = req.body;

    // Update fields
    if (status) contact.status = status;
    if (notes) contact.notes = notes;
    if (assignedTo) contact.assignedTo = assignedTo;
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
 * @desc    Export contacts to CSV
 * @access  Private
 */
router.post('/contacts/export', authenticateToken, (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.body;
    
    let exportContacts = [...store.contacts];

    // Apply filters
    if (type) exportContacts = exportContacts.filter(c => c.type === type);
    if (status) exportContacts = exportContacts.filter(c => c.status === status);
    if (startDate) exportContacts = exportContacts.filter(c => new Date(c.createdAt) >= new Date(startDate));
    if (endDate) exportContacts = exportContacts.filter(c => new Date(c.createdAt) <= new Date(endDate));

    // Generate CSV
    const headers = ['ID', 'Name', 'Email', 'Company', 'Type', 'Messenger', 'Username', 'Status', 'Created At'];
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
        contact.createdAt
      ];
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

