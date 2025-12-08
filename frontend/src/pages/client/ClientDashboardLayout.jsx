import React from 'react';
import ClientDashboard from './ClientDashboard';

const ClientDashboardLayout = ({ user, onLogout }) => {
  return <ClientDashboard user={user} onLogout={onLogout} />;
};

export default ClientDashboardLayout;