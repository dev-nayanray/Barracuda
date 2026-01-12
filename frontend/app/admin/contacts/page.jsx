'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Eye,
  Edit2,
  Trash2,
  Zap,
  Target
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import adminAPI from '@/lib/admin-api';
import ContactsTable from '@/components/admin/ContactsTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';

/**
 * Status options for select
 */
const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'rejected', label: 'Rejected' },
];

/**
 * Admin Contacts Management Page
 */
export default function ContactsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAdmin();
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState('');
  const [editingNotes, setEditingNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.getContacts();
      if (response.success) {
        setContacts(response.data);
      } else {
        setError(response.message || 'Failed to fetch contacts');
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
    }
  }, [isAuthenticated]);

  // Handle view contact
  const handleView = (contact) => {
    setSelectedContact(contact);
    setEditingStatus(contact.status || 'new');
    setEditingNotes(contact.notes || '');
    setShowModal(true);
  };

  // Handle edit contact
  const handleEdit = (contact) => {
    handleView(contact);
  };

  // Handle delete contact
  const handleDelete = async (contact) => {
    if (!confirm(`Are you sure you want to delete ${contact.name}?`)) {
      return;
    }

    try {
      const response = await adminAPI.deleteContact(contact.id);
      if (response.success) {
        fetchContacts();
      } else {
        alert(response.message || 'Failed to delete contact');
      }
    } catch (err) {
      console.error('Failed to delete contact:', err);
      alert('Failed to delete contact');
    }
  };

  // Handle save contact changes
  const handleSave = async () => {
    if (!selectedContact) return;

    setSaving(true);
    try {
      const response = await adminAPI.updateContact(selectedContact.id, {
        status: editingStatus,
        notes: editingNotes
      });

      if (response.success) {
        setShowModal(false);
        fetchContacts();
      } else {
        alert(response.message || 'Failed to update contact');
      }
    } catch (err) {
      console.error('Failed to update contact:', err);
      alert('Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  // Handle export contacts
  const handleExport = async () => {
    try {
      const response = await adminAPI.exportContacts();
      if (response) {
        // Create download link
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export contacts:', err);
      alert('Failed to export contacts');
    }
  };

  // Handle manual Blitz API posting
  const handleBlitzPost = async (contact) => {
    if (!confirm(`Post ${contact.name} to Blitz API?`)) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/contacts/${contact.id}/blitz-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Contact posted to Blitz API successfully');
        fetchContacts();
        setShowModal(false);
      } else {
        alert(data.message || 'Failed to post to Blitz API');
      }
    } catch (err) {
      console.error('Failed to post to Blitz API:', err);
      alert('Failed to post to Blitz API');
    } finally {
      setSaving(false);
    }
  };

  // Handle FTD checking
  const handleCheckFTD = async (contact) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/contacts/${contact.id}/check-ftd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('FTD check completed');
        fetchContacts();
        setShowModal(false);
      } else {
        alert(data.message || 'Failed to check FTD');
      }
    } catch (err) {
      console.error('Failed to check FTD:', err);
      alert('Failed to check FTD');
    } finally {
      setSaving(false);
    }
  };

  // Handle Blitz status update
  const handleUpdateBlitzStatus = async (contact) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/contacts/${contact.id}/update-blitz-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Blitz status updated');
        fetchContacts();
        setShowModal(false);
      } else {
        alert(data.message || 'Failed to update Blitz status');
      }
    } catch (err) {
      console.error('Failed to update Blitz status:', err);
      alert('Failed to update Blitz status');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Contacts</h1>
          <p className="text-text-muted">Manage contact submissions from publishers and advertisers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchContacts}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-center gap-3 text-accent-red">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto hover:opacity-70"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Contacts Table */}
      <ContactsTable
        contacts={contacts}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Contact Detail Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-300">
              <h2 className="text-xl font-bold text-text">Contact Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-surface-300 rounded-lg text-text-muted hover:text-text transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
                  <p className="text-text font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                  <p className="text-text">{selectedContact.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Company</label>
                  <p className="text-text">{selectedContact.company}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Type</label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    selectedContact.type === 'publisher' 
                      ? 'bg-secondary-500/20 text-secondary-400' 
                      : 'bg-primary-500/20 text-primary-400'
                  }`}>
                    {selectedContact.type === 'publisher' ? 'Publisher' : 'Advertiser'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Messenger</label>
                  <p className="text-text">{selectedContact.messenger || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Username</label>
                  <p className="text-text">{selectedContact.username || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Blitz API Status</label>
                  <div className="flex items-center gap-2">
                    {selectedContact.blitzPosted ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-accent-green" />
                        <span className="text-accent-green text-sm">Posted to Blitz</span>
                      </>
                    ) : selectedContact.blitzError ? (
                      <>
                        <XCircle className="w-4 h-4 text-accent-red" />
                        <span className="text-accent-red text-sm">Blitz Error</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-text-muted" />
                        <span className="text-text-muted text-sm">Not posted</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">FTD Status</label>
                  <div className="flex items-center gap-2">
                    {selectedContact.ftd ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-accent-green" />
                        <span className="text-accent-green text-sm">FTD Detected</span>
                        {selectedContact.ftdDate && (
                          <span className="text-xs text-text-muted">
                            ({new Date(selectedContact.ftdDate).toLocaleDateString()})
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-text-muted" />
                        <span className="text-text-muted text-sm">No FTD</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedContact.message && (
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Message</label>
                  <p className="text-text bg-surface-100 p-4 rounded-xl">{selectedContact.message}</p>
                </div>
              )}

              {/* Date */}
              <div className="text-sm text-text-muted">
                Submitted on {new Date(selectedContact.createdAt).toLocaleString()}
              </div>

              {/* Edit Form */}
              <div className="border-t border-surface-300 pt-6 space-y-4">
                <h3 className="font-semibold text-text">Admin Actions</h3>
                
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Status</label>
                  <Select
                    options={statusOptions}
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Notes</label>
                  <Textarea
                    placeholder="Add notes about this contact..."
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Blitz API Actions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-text">Blitz API Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {!selectedContact.blitzPosted && !selectedContact.blitzError && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBlitzPost(selectedContact)}
                        leftIcon={<Zap className="w-4 h-4" />}
                        loading={saving}
                      >
                        Post to Blitz
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckFTD(selectedContact)}
                      leftIcon={<Target className="w-4 h-4" />}
                      loading={saving}
                    >
                      Check FTD
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateBlitzStatus(selectedContact)}
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                      loading={saving}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-300">
              <Button
                variant="ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

