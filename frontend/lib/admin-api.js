/**
 * Admin API Utility
 * Handles all admin API calls with authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://barracuda.marketing/api';

class AdminAPI {
  constructor() {
    this.token = null;
  }

  /**
   * Set auth token for requests
   */
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  /**
   * Get auth token
   */
  getToken() {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
    return this.token;
  }

  /**
   * Clear auth token
   */
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== Auth Routes ====================

  /**
   * Login admin user
   */
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success && data.data.token) {
      this.setToken(data.data.token);
    }

    return data;
  }

  /**
   * Register new admin
   */
  async register(email, password, name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    if (data.success && data.data.token) {
      this.setToken(data.data.token);
    }

    return data;
  }

  /**
   * Get current admin profile
   */
  async getProfile() {
    return this.request('/auth/me');
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  /**
   * Logout - just clear token on client side
   */
  logout() {
    this.clearToken();
  }

  // ==================== Contacts Routes ====================

  /**
   * Get all contacts with filtering
   */
  async getContacts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/contacts${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get contact stats
   */
  async getContactStats() {
    return this.request('/admin/contacts/stats');
  }

  /**
   * Get single contact
   */
  async getContact(id) {
    return this.request(`/admin/contacts/${id}`);
  }

  /**
   * Update contact
   */
  async updateContact(id, updates) {
    return this.request(`/admin/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete contact
   */
  async deleteContact(id) {
    return this.request(`/admin/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Export contacts
   */
  async exportContacts(filters = {}) {
    return this.request('/admin/contacts/export', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // ==================== Settings Routes ====================

  /**
   * Get all settings
   */
  async getSettings() {
    return this.request('/admin/settings');
  }

  /**
   * Update settings
   */
  async updateSettings(updates) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Get dashboard data
   */
  async getDashboard() {
    return this.request('/admin/settings/dashboard');
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings() {
    return this.request('/admin/settings/reset', {
      method: 'POST',
    });
  }
}

// Export singleton instance
const adminAPI = new AdminAPI();

export default adminAPI;

// Export class for custom instances
export { AdminAPI };

