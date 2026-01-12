/**
 * Affiiate Casino Affiliate Network - Express Server
 * Main server entry point
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const contactRoutes = require('./routes/contact');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');
const adminContactsRoutes = require('./routes/admin/contacts');
const adminSettingsRoutes = require('./routes/admin/settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files in production
app.use(express.static(path.join(__dirname, '../frontend/out')));

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminContactsRoutes);
app.use('/api/admin', adminSettingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all route for SPA in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/out/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🎰 Affiiate Backend Server                             ║
║   ═══════════════════════════════════════════════════    ║
║                                                          ║
║   Server running on: http://localhost:${PORT}              ║
║   API Endpoint:      http://localhost:${PORT}/api          ║
║   Health Check:      http://localhost:${PORT}/api/health   ║
║                                                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}                             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

