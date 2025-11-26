import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Building2,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { adminAPI } from '@api';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUserStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto animate-spin text-primary-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const { overview, kyc, registrationTrend } = stats || {};

  // Prepare data for charts
  const roleData = [
    { name: 'Clients', value: overview?.totalClients || 0, color: '#10b981' },
    { name: 'Admins', value: overview?.totalAdmins || 0, color: '#ef4444' },
    { name: 'Agencies', value: overview?.totalAgencies || 0, color: '#3b82f6' },
    { name: 'Insurance', value: overview?.totalInsurance || 0, color: '#8b5cf6' }
  ];

  const kycData = [
    { name: 'Approved', value: kyc?.approved || 0, color: '#10b981' },
    { name: 'Pending', value: kyc?.pending || 0, color: '#f59e0b' },
    { name: 'Rejected', value: kyc?.rejected || 0, color: '#ef4444' }
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-primary-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      orange: 'bg-orange-500',
      purple: 'bg-purple-500'
    };

    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-300">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white">Statistics Dashboard</h1>
        <p className="text-gray-300 mt-1">
          Overview of user statistics and trends
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={overview?.totalUsers?.toLocaleString() || '0'}
          subtitle="All registered users"
          color="primary"
        />
        <StatCard
          icon={UserCheck}
          title="Active Users"
          value={overview?.activeUsers?.toLocaleString() || '0'}
          subtitle="Currently active"
          color="green"
        />
        <StatCard
          icon={UserX}
          title="Banned Users"
          value={overview?.bannedUsers?.toLocaleString() || '0'}
          subtitle="Suspended accounts"
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          title="New Users (30d)"
          value={overview?.newUsersLast30Days?.toLocaleString() || '0'}
          subtitle="Last 30 days"
          color="blue"
        />
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={UserCheck}
          title="Clients"
          value={overview?.totalClients?.toLocaleString() || '0'}
          color="green"
        />
        <StatCard
          icon={Shield}
          title="Admins"
          value={overview?.totalAdmins?.toLocaleString() || '0'}
          color="red"
        />
        <StatCard
          icon={Building2}
          title="Agencies"
          value={overview?.totalAgencies?.toLocaleString() || '0'}
          color="blue"
        />
        <StatCard
          icon={HeartPulse}
          title="Insurance"
          value={overview?.totalInsurance?.toLocaleString() || '0'}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-500" />
            Registration Trend (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={registrationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution Pie */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            User Role Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-4">
            {roleData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KYC Status */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          KYC Verification Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 backdrop-blur-xl bg-green-500/10 border border-green-400/30 rounded-xl hover:bg-green-500/15 transition-colors">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{kyc?.approved || 0}</p>
              <p className="text-sm text-green-700 dark:text-green-300">Approved</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 backdrop-blur-xl bg-yellow-500/10 border border-yellow-400/30 rounded-xl hover:bg-yellow-500/15 transition-colors">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{kyc?.pending || 0}</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 backdrop-blur-xl bg-red-500/10 border border-red-400/30 rounded-xl hover:bg-red-500/15 transition-colors">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{kyc?.rejected || 0}</p>
              <p className="text-sm text-red-700 dark:text-red-300">Rejected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
