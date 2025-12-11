import React, { useState } from 'react';
import ClientSidebar from '../../components/client/ClientSidebar';
import ClientDashboard from './ClientDashboard';
import BrowseCars from './BrowseCars';
import MyReservations from './MyReservations';
import MyContracts from './MyContracts';
import MyInsurance from './MyInsurance';
import PromotionsCoupons from './PromotionsCoupons';
import FeedbackComplaints from './FeedbackComplaints';
import IdentityVerification from './IdentityVerification';
import ClientSettings from './ClientSettings';

const ClientDashboardLayout = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ClientDashboard user={user} />;
      case 'browse-cars':
        return <BrowseCars />;
      case 'my-reservations':
        return <MyReservations />;
      case 'my-contracts':
        return <MyContracts />;
      case 'my-insurance':
        return <MyInsurance />;
      case 'promotions':
        return <PromotionsCoupons />;
      case 'feedback':
        return <FeedbackComplaints />;
      case 'kyc':
        return <IdentityVerification />;
      case 'settings':
        return <ClientSettings user={user} />;
      default:
        return <ClientDashboard user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ClientSidebar
        current={currentView}
        setCurrent={setCurrentView}
        isExpanded={isSidebarExpanded}
        toggleExpanded={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onLogout={onLogout}
        user={user}
      />
      <div className={`flex-1 transition-all duration-500 ${isSidebarExpanded ? 'ml-64' : 'ml-24'}`}>
        {renderView()}
      </div>
    </div>
  );
};

export default ClientDashboardLayout;