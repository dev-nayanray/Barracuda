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
    },
    // Affiliate settings
    affiliate: {
      defaultAffiliateId: '2',
      trackingBaseUrl: 'https://hooplaseft.com/api/v3/offer/2',
      apiKey: process.env.HOOPLASEFT_API_KEY || '',
      autoApprove: false,
      commissionRate: 30, // Default 30% commission
      paymentTerms: 'weekly' // weekly, biweekly, monthly
    }
  }
};

module.exports = store;

