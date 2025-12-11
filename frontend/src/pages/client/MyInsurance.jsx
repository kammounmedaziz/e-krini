import React, { useState, useEffect } from 'react';
import { assuranceAPI } from '@api';
import { Card, Button } from '@ui';
import {
  Shield,
  Plus,
  FileText,
  AlertCircle,
  Check,
  X,
  Calendar,
  DollarSign,
  Clock,
  Eye,
  Car
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyInsurance = () => {
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('policies'); // policies or claims
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [claimForm, setClaimForm] = useState({
    policyId: '',
    incidentDate: '',
    description: '',
    claimAmount: '',
    location: '',
    witnesses: ''
  });

  useEffect(() => {
    fetchPolicies();
    fetchClaims();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await assuranceAPI.getMyPolicies();
      setPolicies(response.data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to load insurance policies');
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      const response = await assuranceAPI.getMyClaims();
      setClaims(response.data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    
    try {
      await assuranceAPI.createClaim({
        ...claimForm,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
      toast.success('Claim submitted successfully');
      setShowClaimModal(false);
      resetClaimForm();
      fetchClaims();
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to submit claim');
    }
  };

  const resetClaimForm = () => {
    setClaimForm({
      policyId: '',
      incidentDate: '',
      description: '',
      claimAmount: '',
      location: '',
      witnesses: ''
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      processing: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };

    const statusIcons = {
      active: Check,
      pending: Clock,
      approved: Check,
      rejected: X,
      expired: AlertCircle,
      processing: Clock
    };

    const Icon = statusIcons[status] || Shield;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Insurance</h1>
            <p className="text-gray-300">Manage your insurance policies and claims</p>
          </div>
          {activeTab === 'policies' && policies.length > 0 && (
            <Button
              variant="primary"
              onClick={() => {
                setSelectedPolicy(null);
                setShowClaimModal(true);
              }}
            >
              <Plus className="w-5 h-5" />
              File Claim
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'policies'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
            }`}
          >
            <Shield className="inline w-5 h-5 mr-2" />
            Insurance Policies
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'claims'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
            }`}
          >
            <FileText className="inline w-5 h-5 mr-2" />
            Claims
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : activeTab === 'policies' ? (
          // Policies List
          policies.length === 0 ? (
            <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg mb-4">No insurance policies found</p>
              <p className="text-gray-400 text-sm">Insurance policies are automatically created with your reservations</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {policies.map(policy => (
                <Card key={policy._id} className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        Policy #{policy.policyNumber}
                      </h3>
                      <p className="text-gray-400 text-sm">{policy.insuranceType}</p>
                    </div>
                    {getStatusBadge(policy.status)}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Car className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-gray-400">Vehicle ID</p>
                        <p className="font-medium">{policy.vehicleId?.slice(-8) || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-gray-400">Coverage Period</p>
                        <p className="font-medium">
                          {new Date(policy.startDate).toLocaleDateString()} - {new Date(policy.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300">
                      <DollarSign className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-gray-400">Premium</p>
                        <p className="font-medium text-cyan-400">{policy.premium} TND</p>
                      </div>
                    </div>
                  </div>

                  {policy.coverage && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
                      <p className="text-sm text-blue-300 font-medium mb-1">Coverage Details:</p>
                      <p className="text-sm text-gray-300">{policy.coverage}</p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedPolicy(policy);
                      setClaimForm(prev => ({ ...prev, policyId: policy._id }));
                      setShowClaimModal(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    File Claim for This Policy
                  </Button>
                </Card>
              ))}
            </div>
          )
        ) : (
          // Claims List
          claims.length === 0 ? (
            <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg mb-4">No claims submitted yet</p>
              <Button variant="primary" onClick={() => setShowClaimModal(true)}>
                <Plus className="w-5 h-5" />
                File Your First Claim
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {claims.map(claim => (
                <Card key={claim._id} className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-16 h-16 text-cyan-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            Claim #{claim.claimNumber || claim._id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-gray-400 text-sm">Policy: {claim.policyNumber}</p>
                        </div>
                        {getStatusBadge(claim.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-xs text-gray-400">Incident Date</p>
                            <p className="font-medium">{new Date(claim.incidentDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-xs text-gray-400">Claim Amount</p>
                            <p className="font-medium text-cyan-400">{claim.claimAmount} TND</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-xs text-gray-400">Submitted</p>
                            <p className="font-medium">{new Date(claim.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg mb-4">
                        <p className="text-sm text-gray-400 mb-1">Description:</p>
                        <p className="text-gray-300">{claim.description}</p>
                      </div>

                      {claim.reviewNotes && (
                        <div className={`p-3 rounded-lg mb-4 ${
                          claim.status === 'approved' 
                            ? 'bg-green-500/10 border border-green-500/30' 
                            : 'bg-red-500/10 border border-red-500/30'
                        }`}>
                          <p className="text-sm font-medium mb-1 ${claim.status === 'approved' ? 'text-green-400' : 'text-red-400'}">
                            Review Notes:
                          </p>
                          <p className="text-sm text-gray-300">{claim.reviewNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </div>

      {/* File Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full backdrop-blur-lg bg-gray-900/90 border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">File Insurance Claim</h2>
              <button
                onClick={() => {
                  setShowClaimModal(false);
                  setSelectedPolicy(null);
                  resetClaimForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Policy *</label>
                <select
                  required
                  value={claimForm.policyId}
                  onChange={(e) => setClaimForm(prev => ({ ...prev, policyId: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select a policy</option>
                  {policies.filter(p => p.status === 'active').map(policy => (
                    <option key={policy._id} value={policy._id}>
                      {policy.policyNumber} - {policy.insuranceType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Incident Date *</label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={claimForm.incidentDate}
                  onChange={(e) => setClaimForm(prev => ({ ...prev, incidentDate: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Claim Amount (TND) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={claimForm.claimAmount}
                  onChange={(e) => setClaimForm(prev => ({ ...prev, claimAmount: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter estimated claim amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Location *</label>
                <input
                  type="text"
                  required
                  value={claimForm.location}
                  onChange={(e) => setClaimForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Where did the incident occur?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={claimForm.description}
                  onChange={(e) => setClaimForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Describe what happened in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Witnesses (Optional)</label>
                <input
                  type="text"
                  value={claimForm.witnesses}
                  onChange={(e) => setClaimForm(prev => ({ ...prev, witnesses: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Names and contact info of witnesses"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowClaimModal(false);
                    setSelectedPolicy(null);
                    resetClaimForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  Submit Claim
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyInsurance;
