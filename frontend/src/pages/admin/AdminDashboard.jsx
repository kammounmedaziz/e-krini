import React from 'react';
import { Card } from '@ui';
import {
  Users,
  Car,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Active Cars',
      value: '156',
      change: '+8%',
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Monthly Revenue',
      value: '$45,230',
      change: '+23%',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Active Reservations',
      value: '89',
      change: '+5%',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'reservation',
      message: 'New reservation: BMW X5 by Ahmed Hassan',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'payment',
      message: 'Payment received: $180 from Sarah Johnson',
      time: '15 minutes ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'car',
      message: 'New car added: Mercedes C-Class 2024',
      time: '1 hour ago',
      status: 'info'
    },
    {
      id: 4,
      type: 'user',
      message: 'New user registered: Mohamed Ali',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: 5,
      type: 'issue',
      message: 'Maintenance required: Audi Q7 (VIN: 123456)',
      time: '3 hours ago',
      status: 'warning'
    }
  ];

  const alerts = [
    {
      id: 1,
      title: 'Low Fuel Alert',
      message: '3 cars have fuel levels below 20%',
      severity: 'warning',
      time: '10 minutes ago'
    },
    {
      id: 2,
      title: 'Overdue Return',
      message: 'Reservation #1234 is 2 hours overdue',
      severity: 'error',
      time: '1 hour ago'
    },
    {
      id: 3,
      title: 'Maintenance Due',
      message: '5 cars require scheduled maintenance',
      severity: 'info',
      time: '2 hours ago'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
        <p className="text-purple-100">Here's what's happening with your car rental business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <div className={`inline-flex p-3 rounded-full ${stat.bgColor} mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {stat.title}
            </p>
            <span className={`text-sm font-semibold ${
              stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change} from last month
            </span>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Recent Activities
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-dark-800/50 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                    activity.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                    'bg-blue-100 dark:bg-blue-900/20'
                  }`}>
                    {activity.type === 'reservation' && <Car className={`w-4 h-4 ${
                      activity.status === 'success' ? 'text-green-600' :
                      activity.status === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />}
                    {activity.type === 'payment' && <DollarSign className="w-4 h-4 text-green-600" />}
                    {activity.type === 'car' && <Car className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'user' && <Users className="w-4 h-4 text-green-600" />}
                    {activity.type === 'issue' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {activity.message}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              System Alerts
            </h3>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.severity === 'error' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                  alert.severity === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' :
                  'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                }`}>
                  <div className="flex items-start gap-3">
                    {alert.severity === 'error' && <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />}
                    {alert.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />}
                    {alert.severity === 'info' && <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />}
                    <div>
                      <h4 className={`font-semibold ${
                        alert.severity === 'error' ? 'text-red-900 dark:text-red-100' :
                        alert.severity === 'warning' ? 'text-yellow-900 dark:text-yellow-100' :
                        'text-blue-900 dark:text-blue-100'
                      }`}>
                        {alert.title}
                      </h4>
                      <p className={`text-sm ${
                        alert.severity === 'error' ? 'text-red-700 dark:text-red-300' :
                        alert.severity === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                        'text-blue-700 dark:text-blue-300'
                      }`}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button className="p-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-left">
                <Car className="w-6 h-6 mb-2" />
                <span className="text-sm font-semibold">Add New Car</span>
              </button>
              <button className="p-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-left">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm font-semibold">Manage Users</span>
              </button>
              <button className="p-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-left">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="text-sm font-semibold">View Reports</span>
              </button>
              <button className="p-4 bg-gradient-to-r from-orange-600 to-red-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-left">
                <AlertTriangle className="w-6 h-6 mb-2" />
                <span className="text-sm font-semibold">System Settings</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Revenue Overview
        </h3>
        <div className="h-64 bg-gray-100 dark:bg-dark-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Revenue chart will be displayed here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Integration with charting library pending
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;