import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '@api';
import {
  Users,
  Car,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  UserCheck,
  UserX,
  UserCog,
  Shield
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const statsResponse = await adminAPI.getUserStatistics();
      setStatistics(statsResponse.data);

      // Fetch recent users
      const usersResponse = await adminAPI.getAllUsers({
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setRecentUsers(usersResponse.data.users || []);

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate stats from fetched data
  const stats = statistics ? [
    {
      title: 'Total Users',
      value: statistics.overview?.totalUsers || 0,
      change: statistics.overview?.newUsersLast30Days 
        ? `+${statistics.overview.newUsersLast30Days} this month`
        : 'No new users',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'Active Users',
      value: statistics.overview?.activeUsers || 0,
      change: statistics.overview?.bannedUsers 
        ? `${statistics.overview.bannedUsers} banned`
        : 'No banned users',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'Pending KYC',
      value: statistics.kyc?.pending || 0,
      change: `${statistics.kyc?.approved || 0} approved`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      onClick: () => navigate('/admin/users?kycStatus=pending')
    },
    {
      title: 'Admin Users',
      value: statistics.overview?.totalAdmins || 0,
      change: `${statistics.overview?.totalAgencies || 0} agencies, ${statistics.overview?.totalInsurance || 0} insurance`,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      onClick: () => navigate('/admin/users?role=admin')
    }
  ] : [];

  // Generate recent activities from real data
  const recentActivities = recentUsers.map((user) => {
    const timeAgo = getTimeAgo(new Date(user.createdAt));
    return {
      id: user._id,
      type: 'user',
      message: `New user registered: ${user.username}`,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
      time: timeAgo,
      status: user.isBanned ? 'warning' : 'success'
    };
  });

  // Generate alerts based on statistics
  const alerts = [];
  
  if (statistics?.kyc?.pending > 0) {
    alerts.push({
      id: 'kyc-pending',
      title: 'KYC Verification Pending',
      message: `${statistics.kyc.pending} user(s) waiting for KYC verification`,
      severity: 'warning',
      action: () => navigate('/admin/users?kycStatus=pending')
    });
  }

  if (statistics?.overview?.bannedUsers > 0) {
    alerts.push({
      id: 'banned-users',
      title: 'Banned Users',
      message: `${statistics.overview.bannedUsers} user(s) are currently banned`,
      severity: 'info',
      action: () => navigate('/admin/users?isBanned=true')
    });
  }

  if (statistics?.kyc?.rejected > 0) {
    alerts.push({
      id: 'kyc-rejected',
      title: 'Rejected KYC Submissions',
      message: `${statistics.kyc.rejected} user(s) have rejected KYC submissions`,
      severity: 'error',
      action: () => navigate('/admin/users?kycStatus=rejected')
    });
  }

  // Helper function to calculate time ago
  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>

      {/* Welcome Section */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">Welcome back, Admin!</h2>
            <p className="text-purple-100">Here's what's happening with your car rental business today.</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 backdrop-blur-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="backdrop-blur-lg bg-red-500/10 border border-red-400/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <h4 className="font-semibold text-red-100">Error Loading Dashboard</h4>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !statistics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-6 animate-pulse">
              <div className="h-32 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                onClick={stat.onClick}
                className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-6 text-center cursor-pointer hover:bg-white/15 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-full ${stat.bgColor} mb-4`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {stat.value.toLocaleString()}
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  {stat.title}
                </p>
                <span className="text-sm text-gray-400">
                  {stat.change}
                </span>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    Recent User Registrations
                  </h3>
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="px-3 py-1.5 text-sm backdrop-blur-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all"
                  >
                    View All
                  </button>
                </div>
                {recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => navigate('/admin/users')}
                      >
                        <div className={`p-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500/20' :
                          activity.status === 'warning' ? 'bg-yellow-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <Users className={`w-4 h-4 ${
                            activity.status === 'success' ? 'text-green-400' :
                            activity.status === 'warning' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {activity.message}
                          </p>
                          <p className="text-sm text-gray-400">
                            {activity.email}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              activity.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                              activity.role === 'agency' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {activity.role}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              activity.kycStatus === 'approved' ? 'bg-green-500/20 text-green-300' :
                              activity.kycStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              KYC: {activity.kycStatus}
                            </span>
                            <span className="text-xs text-gray-400">
                              {activity.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent user registrations</p>
                  </div>
                )}
              </div>
            </div>

            {/* Alerts & Quick Actions */}
            <div className="space-y-6">
              {/* Alerts */}
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  System Alerts
                </h3>
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-lg border cursor-pointer hover:scale-[1.02] transition-all ${
                          alert.severity === 'error' ? 'bg-red-500/10 border-red-400/30' :
                          alert.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-400/30' :
                          'bg-blue-500/10 border-blue-400/30'
                        }`}
                        onClick={alert.action}
                      >
                        <div className="flex items-start gap-3">
                          {alert.severity === 'error' && <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />}
                          {alert.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />}
                          {alert.severity === 'info' && <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />}
                          <div>
                            <h4 className={`font-semibold ${
                              alert.severity === 'error' ? 'text-red-200' :
                              alert.severity === 'warning' ? 'text-yellow-200' :
                              'text-blue-200'
                            }`}>
                              {alert.title}
                            </h4>
                            <p className={`text-sm ${
                              alert.severity === 'error' ? 'text-red-300' :
                              alert.severity === 'warning' ? 'text-yellow-300' :
                              'text-blue-300'
                            }`}>
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-300">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <p className="font-medium text-green-300">All Systems Operational</p>
                    <p className="text-sm mt-1 text-gray-400">No alerts at this time</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => navigate('/admin/users')}
                    className="p-4 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/30 text-white rounded-lg hover:from-blue-500/40 hover:to-cyan-500/40 hover:scale-[1.02] transition-all text-left"
                  >
                    <Users className="w-6 h-6 mb-2" />
                    <span className="text-sm font-semibold">Manage Users</span>
                  </button>
                  <button 
                    onClick={() => navigate('/admin/statistics')}
                    className="p-4 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/30 text-white rounded-lg hover:from-green-500/40 hover:to-emerald-500/40 hover:scale-[1.02] transition-all text-left"
                  >
                    <BarChart3 className="w-6 h-6 mb-2" />
                    <span className="text-sm font-semibold">View Statistics</span>
                  </button>
                  <button 
                    onClick={() => navigate('/admin/settings')}
                    className="p-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/30 text-white rounded-lg hover:from-purple-500/40 hover:to-pink-500/40 hover:scale-[1.02] transition-all text-left"
                  >
                    <UserCog className="w-6 h-6 mb-2" />
                    <span className="text-sm font-semibold">System Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Trend Chart */}
          {statistics?.registrationTrend && statistics.registrationTrend.length > 0 && (
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">
                Registration Trend (Last 7 Days)
              </h3>
              <div className="space-y-4">
                {statistics.registrationTrend.map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-gray-300">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-full h-8 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                        style={{ 
                          width: `${Math.max((day.count / Math.max(...statistics.registrationTrend.map(d => d.count), 1)) * 100, 5)}%` 
                        }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {day.count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;