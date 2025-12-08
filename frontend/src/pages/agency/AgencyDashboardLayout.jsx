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
      case 'vehicles':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">My Vehicles</h1>
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-8">
              <p className="text-gray-300">Vehicle management will be implemented here.</p>
            </div>
          </div>
        );
      case 'bookings':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">Bookings</h1>
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-8">
              <p className="text-gray-300">Booking management will be implemented here.</p>
            </div>
          </div>
        );
      case 'drivers':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">Drivers</h1>
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-8">
              <p className="text-gray-300">Driver management will be implemented here.</p>
            </div>
          </div>
        );
      case 'revenue':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">Revenue</h1>
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-8">
              <p className="text-gray-300">Revenue tracking will be implemented here.</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">Analytics</h1>
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-8">
              <p className="text-gray-300">Analytics and reports will be implemented here.</p>
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">Reviews</h1>
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-8">
              <p className="text-gray-300">Customer reviews will be displayed here.</p>
            </div>
          </div>
        );
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
