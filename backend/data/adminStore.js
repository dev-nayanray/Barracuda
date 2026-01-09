/**
 * Admin Data Store
 * In-memory storage for admin users and settings
 * Replace with database in production
 */

const bcrypt = require('bcryptjs');

// Default admin user (password: admin123)
const admins = [
  {
    id: 1,
    email: 'admin@affiiate.com',
    password: '$2a$10$rQZ5Vh1GhG5vNXK5v5v5v.G5vNXK5v5v5v5v5vNXK5v5v5v5vNX', // admin123 (will be hashed on first use)
    name: 'Super Admin',
    role: 'super_admin',
    createdAt: new Date().toISOString(),
    lastLogin: null
  }
];

// Site settings
const settings = {
  siteName: 'Affiiate',
  siteDescription: 'Premium Casino Affiliate Network',
  companyName: 'Barracuda Marketing',
  contactEmail: 'contact@affiiate.com',
  maintenanceMode: false,
  allowNewRegistrations: true,
  // Analytics settings
  analytics: {
    trackingId: '',
    googleAnalytics: false
  },
  // Notification settings
  notifications: {
    emailOnNewContact: true,
    emailOnNewRegistration: true,
    dailyDigest: false
  },
  // Social links
  social: {
    telegram: 'https://t.me/affiiate',
    skype: 'live:affiiate',
    email: 'contact@affiiate.com'
  }
};

// Initialize default admin with hashed password
const initializeDefaultAdmin = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  admins[0].password = hashedPassword;
  console.log('✅ Default admin initialized: admin@affiiate.com / admin123');
};

// Export methods
const adminStore = {
  // Admin operations
  getAdminByEmail: (email) => admins.find(a => a.email.toLowerCase() === email.toLowerCase()),
  getAdminById: (id) => admins.find(a => a.id === id),
  createAdmin: (adminData) => {
    const newAdmin = {
      id: admins.length + 1,
      ...adminData,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    admins.push(newAdmin);
    return newAdmin;
  },
  updateAdminLogin: (id) => {
    const admin = admins.find(a => a.id === id);
    if (admin) {
      admin.lastLogin = new Date().toISOString();
    }
    return admin;
  },
  getAllAdmins: () => admins.map(a => ({ ...a, password: undefined })),
  
  // Settings operations
  getSettings: () => settings,
  updateSettings: (newSettings) => {
    Object.assign(settings, newSettings);
    return settings;
  },
  
  // Reset helpers
  resetAdmins: () => {
    admins.length = 0;
    admins.push({
      id: 1,
      email: 'admin@affiiate.com',
      password: '$2a$10$rQZ5Vh1GhG5vNXK5v5v5v.G5vNXK5v5v5v5vNXK5v5v5v5vNX',
      name: 'Super Admin',
      role: 'super_admin',
      createdAt: new Date().toISOString(),
      lastLogin: null
    });
  }
};

// Initialize on module load
initializeDefaultAdmin();

module.exports = adminStore;

