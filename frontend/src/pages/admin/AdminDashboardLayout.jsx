import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import AdminDashboard from './AdminDashboard';
import AdminSettings from './AdminSettings';
import {
  LayoutDashboard,
  Users,
  Car,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';

const AdminDashboardLayout = ({ user, onLogout }) => {
  const adminNavItems = [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      path: '/admin/users',
      name: 'User Management',
      icon: Users
    },
    {
      path: '/admin/cars',
      name: 'Car Inventory',
      icon: Car
    },
    {
      path: '/admin/reservations',
      name: 'Reservations',
      icon: Calendar
    },
    {
      path: '/admin/reports',
      name: 'Reports',
      icon: BarChart3
    },
    {
      path: '/admin/settings',
      name: 'System Settings',
      icon: Settings
    }
  ];

  return (
    <DashboardLayout
      navigation={adminNavItems}
      user={user}
      onLogout={onLogout}
      theme="admin"
      title="Admin Dashboard"
    >
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/settings" element={<AdminSettings />} />
        {/* Placeholder routes for future pages */}
        <Route path="/users" element={<div className="p-8 text-center text-gray-500">User Management - Coming Soon</div>} />
        <Route path="/cars" element={<div className="p-8 text-center text-gray-500">Car Inventory - Coming Soon</div>} />
        <Route path="/reservations" element={<div className="p-8 text-center text-gray-500">Reservations - Coming Soon</div>} />
        <Route path="/reports" element={<div className="p-8 text-center text-gray-500">Reports - Coming Soon</div>} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboardLayout;