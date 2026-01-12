'use client';

import { useState } from 'react';
import { 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  User,
  MessageSquare,
  Mail,
  Building2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

/**
 * Status badge component
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    new: { color: 'bg-blue-500/20 text-blue-400', icon: Clock, label: 'New' },
    contacted: { color: 'bg-yellow-500/20 text-yellow-400', icon: MessageSquare, label: 'Contacted' },
    qualified: { color: 'bg-accent-green/20 text-accent-green', icon: CheckCircle, label: 'Qualified' },
    rejected: { color: 'bg-accent-red/20 text-accent-red', icon: XCircle, label: 'Rejected' },
  };

  const config = statusConfig[status] || statusConfig.new;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

/**
 * Contacts Table Component
 * Displays contacts with search, filter, and actions
 */
export default function ContactsTable({ 
  contacts = [], 
  loading = false, 
  onView, 
  onEdit, 
  onDelete 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  // Filter contacts based on search and filters
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || contact.type === filterType;
    const matchesStatus = !filterStatus || contact.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'publisher', label: 'Publisher' },
    { value: 'advertiser', label: 'Advertiser' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            options={typeOptions}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-100 border-b border-surface-300">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-text-muted">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      Loading contacts...
                    </div>
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-text-muted">
                    No contacts found
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    className="hover:bg-surface-100/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="font-medium text-text">{contact.name}</p>
                          <p className="text-sm text-text-muted">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-text">
                        <Building2 className="w-4 h-4 text-text-muted" />
                        {contact.company}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        contact.type === 'publisher' 
                          ? 'bg-secondary-500/20 text-secondary-400' 
                          : 'bg-primary-500/20 text-primary-400'
                      }`}>
                        {contact.type === 'publisher' ? 'Publisher' : 'Advertiser'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={contact.status || 'new'} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {contact.blitzPosted ? (
                          <CheckCircle className="w-4 h-4 text-accent-green" />
                        ) : contact.blitzError ? (
                          <XCircle className="w-4 h-4 text-accent-red" />
                        ) : (
                          <Clock className="w-4 h-4 text-text-muted" />
                        )}
                        <span className={`text-xs ${
                          contact.blitzPosted ? 'text-accent-green' :
                          contact.blitzError ? 'text-accent-red' : 'text-text-muted'
                        }`}>
                          {contact.blitzPosted ? 'Posted' : contact.blitzError ? 'Error' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {contact.ftd ? (
                          <CheckCircle className="w-4 h-4 text-accent-green" />
                        ) : (
                          <Clock className="w-4 h-4 text-text-muted" />
                        )}
                        <span className={`text-xs ${
                          contact.ftd ? 'text-accent-green' : 'text-text-muted'
                        }`}>
                          {contact.ftd ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted text-sm">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === contact.id ? null : contact.id)}
                            className="p-2 rounded-lg hover:bg-surface-300 text-text-muted hover:text-text transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {openMenu === contact.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-surface-200 border border-surface-300 rounded-xl shadow-lg z-10 py-1">
                              <button
                                onClick={() => {
                                  onView?.(contact);
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface-300 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={() => {
                                  onEdit?.(contact);
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface-300 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  onDelete?.(contact);
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-accent-red hover:bg-surface-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      {!loading && filteredContacts.length > 0 && (
        <p className="text-sm text-text-muted">
          Showing {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

