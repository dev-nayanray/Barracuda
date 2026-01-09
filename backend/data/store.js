/**
 * Shared Data Store
 * Centralized in-memory storage for contacts (for demo purposes)
 * In production, replace with a proper database
 */

const store = {
  // Contacts from the public contact form
  contacts: [],
  
  // Site settings
  settings: {
    siteName: 'Barracuda',
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
      telegram: '',
      skype: '',
      email: ''
    }
  }
};

module.exports = store;

