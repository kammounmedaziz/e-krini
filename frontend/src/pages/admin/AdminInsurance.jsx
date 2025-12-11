import React, { useState, useEffect } from 'react';
import { assuranceAPI } from '@api';
import { Card } from '@ui';
import { Shield, FileText, DollarSign, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminInsurance = () => {
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('policies');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [policiesRes, claimsRes] = await Promise.all([
        assuranceAPI.getAllPolicies(),
        assuranceAPI.getAllClaims()
      ]);
      setPolicies(policiesRes.data || []);
      setClaims(claimsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load insurance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      active: 'green',
      approved: 'green',
      rejected: 'red',
      expired: 'gray',
      cancelled: 'red',
      paid: 'purple'
    };
    return colors[status?.toLowerCase()] || 'gray';
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Insurance Overview</h1>
          <p className="text-gray-300">System-wide insurance policies and claims</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="backdrop-blur-lg bg-blue-500/20 border border-blue-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{policies.length}</div>
              <div className="text-sm text-gray-300">Total Policies</div>
            </div>
          </Card>
          <Card className="backdrop-blur-lg bg-green-500/20 border border-green-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {policies.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-gray-300">Active</div>
            </div>
          </Card>
          <Card className="backdrop-blur-lg bg-yellow-500/20 border border-yellow-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{claims.length}</div>
              <div className="text-sm text-gray-300">Total Claims</div>
            </div>
          </Card>
          <Card className="backdrop-blur-lg bg-purple-500/20 border border-purple-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {claims.filter(c => c.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-300">Approved</div>
            </div>
          </Card>
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
            Policies
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
          <div className="space-y-4">
            {policies.map(policy => {
              const statusColor = getStatusColor(policy.status);
              return (
                <Card
                  key={policy._id}
                  className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Policy #{policy.policyNumber}</h3>
                      <p className="text-gray-400 text-sm capitalize">{policy.type}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30`}>
                      {policy.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="text-xs text-gray-400">Customer</div>
                        <div className="text-sm font-medium">{policy.userId?.username || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="text-xs text-gray-400">Premium</div>
                        <div className="text-sm font-medium">{policy.premium} TND</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div>
                        <div className="text-xs text-gray-400">Start Date</div>
                        <div className="text-sm font-medium">{new Date(policy.startDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div>
                        <div className="text-xs text-gray-400">End Date</div>
                        <div className="text-sm font-medium">{new Date(policy.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map(claim => {
              const statusColor = getStatusColor(claim.status);
              return (
                <Card
                  key={claim._id}
                  className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Claim #{claim.claimNumber}</h3>
                      <p className="text-gray-400 text-sm">{claim.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30`}>
                      {claim.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="text-xs text-gray-400">Customer</div>
                        <div className="text-sm font-medium">{claim.userId?.username || 'N/A'}</div>
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
                    <div className="flex items-center gap-2 text-gray-300">
                      <div>
                        <div className="text-xs text-gray-400">Date</div>
                        <div className="text-sm font-medium">{new Date(claim.incidentDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInsurance;
