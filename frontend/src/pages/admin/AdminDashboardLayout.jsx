import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import AdminDashboard from './AdminDashboard';
import AdminSettings from './AdminSettings';

const AdminDashboardLayout = () => {
  const adminNavItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard'
    },
    {
      path: '/admin/users',
      label: 'User Management',
      icon: 'Users'
    },
    {
      path: '/admin/cars',
      label: 'Car Inventory',
      icon: 'Car'
    },
    {
      path: '/admin/reservations',
      label: 'Reservations',
      icon: 'Calendar'
    },
    {
      path: '/admin/reports',
      label: 'Reports',
      icon: 'BarChart3'
    },
    {
      path: '/admin/settings',
      label: 'System Settings',
      icon: 'Settings'
    }
  ];

  return (
    <DashboardLayout
      navItems={adminNavItems}
      userRole="admin"
      userName="Admin User"
      userEmail="admin@ekrini.com"
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