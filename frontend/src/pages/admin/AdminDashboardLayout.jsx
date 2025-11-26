import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminSettings from './AdminSettings';
import UserManagement from './UserManagement';
import AdminStatistics from './AdminStatistics';
import AgencyManagement from './AgencyManagement';
import InsuranceManagement from './InsuranceManagement';
import AdminKYCReview from './AdminKYCReview';

const AdminDashboardLayout = ({ user, onLogout }) => {
  const [current, setCurrent] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const renderContent = () => {
    switch (current) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'statistics':
        return <AdminStatistics />;
      case 'users':
        return <UserManagement />;
      case 'kyc':
        return <AdminKYCReview />;
      case 'agencies':
        return <AgencyManagement />;
      case 'insurance':
        return <InsuranceManagement />;
      case 'settings':
        return <AdminSettings />;
      case 'cars':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">Car Inventory</h1>
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-8">
              <p className="text-gray-300">Car inventory management will be implemented here.</p>
            </div>
          </div>
        );
      case 'reservations':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">Reservations</h1>
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-8">
              <p className="text-gray-300">Reservation management will be implemented here.</p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">Reports</h1>
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-8">
              <p className="text-gray-300">Reports and analytics will be displayed here.</p>
            </div>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="flex">
        <AdminSidebar
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

export default AdminDashboardLayout;