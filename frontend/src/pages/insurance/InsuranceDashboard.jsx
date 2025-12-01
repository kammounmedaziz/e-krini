import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText,
  AlertCircle,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';

const InsuranceDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const statsRes = await axios.get('http://localhost:3001/api/v1/insurance/dashboard/stats', config);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.error?.message || 'Failed to load dashboard');
      if (error.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: 'Total Policies',
      value: stats?.statistics?.totalPolicies || 0,
      icon: FileText,
      color: 'text-emerald-300',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-400/30'
    },
    {
      title: 'Active Policies',
      value: stats?.statistics?.activePolicies || 0,
      icon: CheckCircle,
      color: 'text-green-300',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/30'
    },
    {
      title: 'Total Claims',
      value: stats?.statistics?.totalClaims || 0,
      icon: AlertCircle,
      color: 'text-orange-300',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-400/30'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.statistics?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-300',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400/30'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Insurance Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your insurance overview</p>
      </div>

      {/* Status Banner */}
      {stats?.status && (
        <div className={`mb-6 backdrop-blur-xl bg-gradient-to-r rounded-xl p-4 shadow-lg border ${
          stats.status === 'approved'
            ? 'from-green-500/20 to-emerald-500/20 border-green-400/30'
            : stats.status === 'pending'
            ? 'from-yellow-500/20 to-amber-500/20 border-yellow-400/30'
            : 'from-red-500/20 to-pink-500/20 border-red-400/30'
        }`}>
          <div className="flex items-start gap-3">
            {stats.status === 'approved' ? (
              <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-0.5" />
            ) : stats.status === 'pending' ? (
              <Clock className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-300 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-bold text-white mb-1">
                Account Status: {stats.status.charAt(0).toUpperCase() + stats.status.slice(1)}
              </h3>
              <p className="text-sm text-gray-200">
                {stats.status === 'approved' && 'Your insurance account is approved and active.'}
                {stats.status === 'pending' && 'Your insurance account is pending approval by administrators.'}
                {stats.status === 'rejected' && 'Your insurance account application was not approved.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <div
            key={index}
            className={`backdrop-blur-xl bg-gradient-to-r ${stat.bgColor} border ${stat.borderColor} rounded-xl shadow-lg p-6 transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-sm text-gray-300 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Claims Overview */}
      {stats?.statistics && (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Claims Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Approved Claims</p>
              <p className="text-3xl font-bold text-green-400">{stats.statistics.approvedClaims || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Approval Rate</p>
              <p className="text-3xl font-bold text-white">
                {stats.statistics.totalClaims 
                  ? ((stats.statistics.approvedClaims / stats.statistics.totalClaims) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <p className="text-gray-400">No recent activity to display</p>
      </div>
    </div>
  );
};

export default InsuranceDashboard;
