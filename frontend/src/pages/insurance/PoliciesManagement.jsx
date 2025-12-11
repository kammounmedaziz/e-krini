import React, { useState, useEffect } from 'react';
import { assuranceAPI } from '@api';
import { Card, Button } from '@ui';
import {
  Shield,
  User,
  Calendar,
  DollarSign,
  Check,
  X,
  Eye,
  Filter,
  Search,
  Clock,
  AlertTriangle,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const PoliciesManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await assuranceAPI.getAllPolicies();
      setPolicies(response.data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePolicy = async (policyId) => {
    try {
      setActionLoading(true);
      await assuranceAPI.approvePolicy(policyId);
      toast.success('Policy approved successfully');
      fetchPolicies();
      if (selectedPolicy?._id === policyId) {
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error approving policy:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to approve policy');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPolicy = async (policyId) => {
    if (!window.confirm('Are you sure you want to cancel this policy?')) return;

    try {
      setActionLoading(true);
      await assuranceAPI.cancelPolicy(policyId);
      toast.success('Policy cancelled');
      fetchPolicies();
      if (selectedPolicy?._id === policyId) {
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error cancelling policy:', error);
      toast.error('Failed to cancel policy');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      active: 'green',
      expired: 'gray',
      cancelled: 'red'
    };
    return colors[status?.toLowerCase()] || 'gray';
  };

  const getTypeColor = (type) => {
    const colors = {
      basic: 'blue',
      premium: 'purple',
      comprehensive: 'cyan'
    };
    return colors[type?.toLowerCase()] || 'blue';
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    const matchesSearch = 
      searchTerm === '' ||
      policy.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: policies.length,
    pending: policies.filter(p => p.status === 'pending').length,
    active: policies.filter(p => p.status === 'active').length,
    expired: policies.filter(p => p.status === 'expired').length,
    cancelled: policies.filter(p => p.status === 'cancelled').length
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Policies Management</h1>
          <p className="text-gray-300">Review and manage insurance policies</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Card
              key={status}
              className={`backdrop-blur-lg bg-white/10 border border-white/20 transition-all cursor-pointer ${
                statusFilter === status ? 'ring-2 ring-cyan-500' : 'hover:border-cyan-500/50'
              }`}
              onClick={() => setStatusFilter(status)}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{count}</div>
                <div className="text-sm text-gray-300 capitalize">{status}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="mb-6 backdrop-blur-lg bg-white/10 border border-white/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer, email, or policy number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </Card>

        {/* Policies List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredPolicies.length === 0 ? (
          <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No policies found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPolicies.map(policy => {
              const statusColor = getStatusColor(policy.status);
              const typeColor = getTypeColor(policy.type);

              return (
                <Card
                  key={policy._id}
                  className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            Policy #{policy.policyNumber}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${typeColor}-500/20 text-${typeColor}-400 border border-${typeColor}-500/30 capitalize`}>
                              {policy.type}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30 capitalize`}>
                              {policy.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="text-xs text-gray-400">Customer</div>
                            <div className="text-sm font-medium">{policy.userId?.username || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="text-xs text-gray-400">Start Date</div>
                            <div className="text-sm font-medium">
                              {new Date(policy.startDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="text-xs text-gray-400">End Date</div>
                            <div className="text-sm font-medium">
                              {new Date(policy.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <div>
                            <div className="text-xs text-gray-400">Premium</div>
                            <div className="text-sm font-medium">{policy.premium} TND</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        {policy.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprovePolicy(policy._id)}
                              disabled={actionLoading}
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancelPolicy(policy._id)}
                              disabled={actionLoading}
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-lg bg-gray-900/95 border-2 border-cyan-500/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Policy Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Policy #{selectedPolicy.policyNumber}</h3>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getTypeColor(selectedPolicy.type)}-500/20 text-${getTypeColor(selectedPolicy.type)}-400 border border-${getTypeColor(selectedPolicy.type)}-500/30 capitalize`}>
                      {selectedPolicy.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(selectedPolicy.status)}-500/20 text-${getStatusColor(selectedPolicy.status)}-400 border border-${getStatusColor(selectedPolicy.status)}-500/30 capitalize`}>
                      {selectedPolicy.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Customer</div>
                    <div className="text-white font-medium">{selectedPolicy.userId?.username || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Email</div>
                    <div className="text-white font-medium">{selectedPolicy.userId?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Start Date</div>
                    <div className="text-white font-medium">{new Date(selectedPolicy.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">End Date</div>
                    <div className="text-white font-medium">{new Date(selectedPolicy.endDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Premium</div>
                    <div className="text-green-400 font-bold text-lg">{selectedPolicy.premium} TND</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Coverage Amount</div>
                    <div className="text-white font-medium">{selectedPolicy.coverageAmount} TND</div>
                  </div>
                </div>

                {selectedPolicy.coverageDetails && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Coverage Details</div>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <ul className="space-y-2 text-gray-300 text-sm">
                        {Object.entries(selectedPolicy.coverageDetails).map(([key, value]) => (
                          <li key={key} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span><strong className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {selectedPolicy.status === 'pending' && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button
                      variant="danger"
                      onClick={() => handleCancelPolicy(selectedPolicy._id)}
                      disabled={actionLoading}
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleApprovePolicy(selectedPolicy._id)}
                      disabled={actionLoading}
                    >
                      <Check className="w-4 h-4" />
                      Approve Policy
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliciesManagement;
