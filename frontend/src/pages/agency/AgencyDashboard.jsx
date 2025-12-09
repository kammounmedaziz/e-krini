import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Calendar,
  DollarSign,
  Star,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { agencyAPI } from '../../api';

const AgencyDashboard = () => {
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

      const statsRes = await agencyAPI.getDashboardStats();
      setStats(statsRes.data);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
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
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: 'Total Bookings',
      value: stats?.statistics?.totalBookings || 0,
      icon: Calendar,
      color: 'text-blue-300',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-400/30'
    },
    {
      title: 'Active Vehicles',
      value: stats?.statistics?.activeVehicles || 0,
      icon: Car,
      color: 'text-purple-300',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400/30'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.statistics?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-300',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/30'
    },
    {
      title: 'Average Rating',
      value: stats?.rating?.average?.toFixed(1) || '0.0',
      icon: Star,
      color: 'text-yellow-300',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-400/30'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Agency Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your agency overview</p>
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
                {stats.status === 'approved' && 'Your agency account is approved and active.'}
                {stats.status === 'pending' && 'Your agency account is pending approval by administrators.'}
                {stats.status === 'rejected' && 'Your agency account application was not approved.'}
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

      {/* Recent Activity Section */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <p className="text-gray-400">No recent activity to display</p>
      </div>
    </div>
  );
};

export default AgencyDashboard;
