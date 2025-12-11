import React, { useState, useEffect } from 'react';
import { assuranceAPI } from '@api';
import { Card, Button } from '@ui';
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  Check,
  X,
  Eye,
  Search,
  AlertTriangle,
  CreditCard,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const ClaimsManagement = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    notes: '',
    approvedAmount: ''
  });

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await assuranceAPI.getAllClaims();
      setClaims(response.data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClaim = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await assuranceAPI.reviewClaim(selectedClaim._id, reviewData);
      toast.success('Claim reviewed successfully');
      setShowReviewModal(false);
      setShowDetailsModal(false);
      fetchClaims();
    } catch (error) {
      console.error('Error reviewing claim:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to review claim');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessPayment = async (claimId, amount) => {
    if (!window.confirm(`Process payment of ${amount} TND?`)) return;

    try {
      setActionLoading(true);
      await assuranceAPI.processPayment(claimId, { amount });
      toast.success('Payment processed successfully');
      fetchClaims();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      'under-review': 'blue',
      approved: 'green',
      rejected: 'red',
      paid: 'purple'
    };
    return colors[status?.toLowerCase()] || 'gray';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      'under-review': Eye,
      approved: Check,
      rejected: X,
      paid: CreditCard
    };
    return icons[status?.toLowerCase()] || Clock;
  };

  const filteredClaims = claims.filter(claim => {
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesSearch = 
      searchTerm === '' ||
      claim.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    'under-review': claims.filter(c => c.status === 'under-review').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
    paid: claims.filter(c => c.status === 'paid').length
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Claims Management</h1>
          <p className="text-gray-300">Review and process insurance claims</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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
                <div className="text-xs text-gray-300 capitalize">{status.replace('-', ' ')}</div>
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
              placeholder="Search by customer, claim number, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </Card>

        {/* Claims List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredClaims.length === 0 ? (
          <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No claims found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredClaims.map(claim => {
              const StatusIcon = getStatusIcon(claim.status);
              const statusColor = getStatusColor(claim.status);

              return (
                <Card
                  key={claim._id}
                  className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            Claim #{claim.claimNumber}
                          </h3>
                          <p className="text-gray-400 text-sm">{claim.description}</p>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2 bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30`}>
                            <StatusIcon className="w-3 h-3" />
                            {claim.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="text-xs text-gray-400">Customer</div>
                            <div className="text-sm font-medium">{claim.userId?.username || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="text-xs text-gray-400">Incident Date</div>
                            <div className="text-sm font-medium">
                              {new Date(claim.incidentDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign className="w-4 h-4 text-yellow-400" />
                          <div>
                            <div className="text-xs text-gray-400">Claimed</div>
                            <div className="text-sm font-medium">{claim.claimedAmount} TND</div>
                          </div>
                        </div>
                        {claim.approvedAmount && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <div>
                              <div className="text-xs text-gray-400">Approved</div>
                              <div className="text-sm font-medium">{claim.approvedAmount} TND</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        {(claim.status === 'pending' || claim.status === 'under-review') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedClaim(claim);
                              setReviewData({
                                status: 'approved',
                                notes: '',
                                approvedAmount: claim.claimedAmount
                              });
                              setShowReviewModal(true);
                            }}
                          >
                            <Check className="w-4 h-4" />
                            Review Claim
                          </Button>
                        )}
                        {claim.status === 'approved' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleProcessPayment(claim._id, claim.approvedAmount)}
                            disabled={actionLoading}
                          >
                            <CreditCard className="w-4 h-4" />
                            Process Payment
                          </Button>
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
        {showDetailsModal && selectedClaim && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-lg bg-gray-900/95 border-2 border-cyan-500/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Claim Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Claim #{selectedClaim.claimNumber}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(selectedClaim.status)}-500/20 text-${getStatusColor(selectedClaim.status)}-400 border border-${getStatusColor(selectedClaim.status)}-500/30`}>
                    {selectedClaim.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Customer</div>
                    <div className="text-white font-medium">{selectedClaim.userId?.username || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Incident Date</div>
                    <div className="text-white font-medium">{new Date(selectedClaim.incidentDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Claimed Amount</div>
                    <div className="text-yellow-400 font-bold">{selectedClaim.claimedAmount} TND</div>
                  </div>
                  {selectedClaim.approvedAmount && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Approved Amount</div>
                      <div className="text-green-400 font-bold">{selectedClaim.approvedAmount} TND</div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-2">Description</div>
                  <p className="text-white p-3 bg-white/5 rounded-lg border border-white/10">
                    {selectedClaim.description}
                  </p>
                </div>

                {selectedClaim.reviewNotes && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Review Notes</div>
                    <p className="text-white p-3 bg-white/5 rounded-lg border border-white/10">
                      {selectedClaim.reviewNotes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  {(selectedClaim.status === 'pending' || selectedClaim.status === 'under-review') && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setReviewData({
                          status: 'approved',
                          notes: '',
                          approvedAmount: selectedClaim.claimedAmount
                        });
                        setShowReviewModal(true);
                      }}
                    >
                      <Check className="w-4 h-4" />
                      Review Claim
                    </Button>
                  )}
                  {selectedClaim.status === 'approved' && (
                    <Button
                      variant="primary"
                      onClick={() => handleProcessPayment(selectedClaim._id, selectedClaim.approvedAmount)}
                      disabled={actionLoading}
                    >
                      <CreditCard className="w-4 h-4" />
                      Process Payment
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedClaim && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full backdrop-blur-lg bg-gray-900/95 border-2 border-cyan-500/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Review Claim</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleReviewClaim} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Decision *
                  </label>
                  <select
                    value={reviewData.status}
                    onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="approved" className="bg-gray-800">Approve</option>
                    <option value="rejected" className="bg-gray-800">Reject</option>
                    <option value="under-review" className="bg-gray-800">Need More Info</option>
                  </select>
                </div>

                {reviewData.status === 'approved' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Approved Amount (TND) *
                    </label>
                    <input
                      type="number"
                      value={reviewData.approvedAmount}
                      onChange={(e) => setReviewData({ ...reviewData, approvedAmount: e.target.value })}
                      required
                      step="0.01"
                      min="0"
                      max={selectedClaim.claimedAmount}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Claimed amount: {selectedClaim.claimedAmount} TND
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Review Notes *
                  </label>
                  <textarea
                    value={reviewData.notes}
                    onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                    required
                    rows={4}
                    placeholder="Provide detailed notes about your decision..."
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={actionLoading}>
                    <Check className="w-4 h-4" />
                    Submit Review
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsManagement;
