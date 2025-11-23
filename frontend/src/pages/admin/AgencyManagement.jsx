import React, { useState, useEffect } from 'react';
import { adminAPI } from '@api';
import toast from 'react-hot-toast';
import {
  Building2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Pause,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AgencyManagement = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAgencies: 0,
    limit: 10
  });
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');

  const fetchAgencies = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllAgencies({
        page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter
      });
      setAgencies(response.data.agencies);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch agencies');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies(pagination.currentPage);
  }, [searchTerm, statusFilter]);

  const handleAction = async () => {
    try {
      if (actionType === 'approve') {
        await adminAPI.approveAgency(selectedAgency._id, actionReason);
        toast.success('Agency approved successfully');
      } else if (actionType === 'reject') {
        if (!actionReason.trim()) {
          toast.error('Rejection reason is required');
          return;
        }
        await adminAPI.rejectAgency(selectedAgency._id, actionReason);
        toast.success('Agency rejected successfully');
      } else if (actionType === 'suspend') {
        if (!actionReason.trim()) {
          toast.error('Suspension reason is required');
          return;
        }
        await adminAPI.suspendAgency(selectedAgency._id, actionReason);
        toast.success('Agency suspended successfully');
      } else if (actionType === 'delete') {
        await adminAPI.deleteAgency(selectedAgency._id);
        toast.success('Agency deleted successfully');
      }
      setShowModal(false);
      setActionReason('');
      fetchAgencies(pagination.currentPage);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Action failed');
    }
  };

  const openActionModal = (agency, action) => {
    setSelectedAgency(agency);
    setActionType(action);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
      approved: 'bg-green-500/20 text-green-300 border-green-400/30',
      suspended: 'bg-red-500/20 text-red-300 border-red-400/30',
      rejected: 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Agency Management</h1>
        <button
          onClick={() => fetchAgencies(pagination.currentPage)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 backdrop-blur-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-400 appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agencies Table */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
            <p className="text-gray-300">Loading agencies...</p>
          </div>
        ) : agencies.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300">No agencies found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Registered</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {agencies.map((agency) => (
                  <tr key={agency._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {agency.logo ? (
                          <img src={agency.logo} alt={agency.companyName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-purple-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{agency.companyName}</p>
                          <p className="text-sm text-gray-400">{agency.companyRegistrationNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm">{agency.email}</p>
                      <p className="text-gray-400 text-sm">{agency.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm">{agency.address?.city || 'N/A'}</p>
                      <p className="text-gray-400 text-sm">{agency.address?.country || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(agency.status)}
                    </td>
                    <td className="px-6 py-4 text-white text-sm">
                      {new Date(agency.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {agency.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openActionModal(agency, 'approve')}
                              className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-all"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openActionModal(agency, 'reject')}
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {agency.status === 'approved' && (
                          <button
                            onClick={() => openActionModal(agency, 'suspend')}
                            className="p-2 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-all"
                            title="Suspend"
                          >
                            <Pause className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => openActionModal(agency, 'delete')}
                          className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-sm text-gray-300">
              Showing {agencies.length} of {pagination.totalAgencies} agencies
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchAgencies(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="p-2 backdrop-blur-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchAgencies(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2 backdrop-blur-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/20 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {actionType === 'approve' && 'Approve Agency'}
              {actionType === 'reject' && 'Reject Agency'}
              {actionType === 'suspend' && 'Suspend Agency'}
              {actionType === 'delete' && 'Delete Agency'}
            </h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to {actionType} <span className="font-semibold">{selectedAgency?.companyName}</span>?
            </p>
            {(actionType === 'reject' || actionType === 'suspend' || actionType === 'approve') && (
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={actionType === 'approve' ? 'Notes (optional)' : `${actionType === 'reject' ? 'Rejection' : 'Suspension'} reason (required)`}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 mb-4"
                rows={4}
                required={actionType !== 'approve'}
              />
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setActionReason('');
                }}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 px-4 py-2 rounded-lg transition-all text-white ${
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyManagement;
