import React, { useState, useEffect } from 'react';
import AgencySidebar from '../../components/agency/AgencySidebar';
import AgencyDashboard from './AgencyDashboard';
import AgencySettings from './AgencySettings';

const AgencyDashboardLayout = ({ user: initialUser, onLogout }) => {
  const [current, setCurrent] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [user, setUser] = useState(initialUser);

  // Listen for user data changes
  useEffect(() => {
    const handleAuthChange = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    };

    setUser(initialUser);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [initialUser]);

  const renderContent = () => {
    switch (current) {
      case 'dashboard':
        return <AgencyDashboard />;
      case 'fleet':
        const FleetManagement = require('./FleetManagement').default;
        return <FleetManagement />;
      case 'reservations':
        const AgencyReservations = require('./AgencyReservations').default;
        return <AgencyReservations />;
      case 'maintenance':
        const MaintenanceManagement = require('./MaintenanceManagement').default;
        return <MaintenanceManagement />;
      case 'profile':
        const AgencyProfile = require('./AgencyProfile').default;
        return <AgencyProfile />;
      case 'settings':
        return <AgencySettings />;
      default:
        return <AgencyDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="flex">
        <AgencySidebar
          current={current}
          setCurrent={setCurrent}
          isExpanded={isSidebarExpanded}
          toggleExpanded={() => setIsSidebarExpanded(!isSidebarExpanded)}
          onLogout={onLogout}
          user={user}
        />
        <main className={`flex-1 min-h-screen overflow-y-auto ${isSidebarExpanded ? 'ml-64' : 'ml-24'} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}>
          <div className="p-6">
            <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl border border-gray-700 p-6">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgencyDashboardLayout;
