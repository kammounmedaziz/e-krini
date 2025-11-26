import React from 'react';
import PropTypes from 'prop-types';
import ProfilePicture from '../shared/ProfilePicture';
import {
  LayoutDashboard,
  Users,
  Car,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  PieChart,
  Shield,
  Building2,
  HeartPulse,
  FileCheck,
  MessageSquare,
  FileText
} from 'lucide-react';

const AdminSidebar = ({ current, setCurrent, isExpanded, toggleExpanded, onLogout, user }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'statistics', label: 'Statistics', icon: PieChart },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'kyc', label: 'KYC Review', icon: FileCheck },
    { id: 'agencies', label: 'Agencies', icon: Building2 },
    { id: 'agency-documents', label: 'Agency Documents', icon: FileText },
    { id: 'insurance', label: 'Insurance', icon: HeartPulse },
    { id: 'insurance-documents', label: 'Insurance Documents', icon: FileText },
    { id: 'cars', label: 'Car Inventory', icon: Car },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'feedback', label: 'Feedback Management', icon: MessageSquare },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'logout', label: 'Log out', icon: LogOut },
  ];

  const mainItems = items.filter(it => it.id !== 'logout');
  const logoutItem = items.find(it => it.id === 'logout');
  const LogoutIcon = logoutItem.icon;
  const iconSize = isExpanded ? 'w-6 h-6' : 'w-8 h-8';

  const handleItemClick = (itemId) => {
    if (itemId === 'logout') {
      onLogout();
    } else {
      setCurrent(itemId);
    }
  };

  return (
    <div className={`fixed left-0 top-0 backdrop-blur-md bg-black/20 border-r border-white/10 ${isExpanded ? 'p-4 w-64' : 'p-2 w-24'} h-screen flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-50`} style={{ willChange: 'width, padding' }}>
      <div className={`mb-6 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}>
        <div className={isExpanded ? '' : 'hidden'}>
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        </div>
        <button onClick={toggleExpanded} className="text-white hover:text-gray-300 p-1">
          <Menu className={`stroke-current origin-center transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${iconSize} ${isExpanded ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className={`mb-4 ${isExpanded ? 'p-3 bg-white/10 rounded-lg backdrop-blur-sm' : 'flex justify-center'}`}>
          {isExpanded ? (
            <div className="flex items-center gap-3">
              <ProfilePicture user={user} size="md" editable={false} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username || user?.name || 'Admin'}
                </p>
                <p className="text-xs text-purple-300 truncate">
                  {user?.email || 'admin@example.com'}
                </p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              </div>
            </div>
          ) : (
            <div className="p-1 relative">
              <ProfilePicture user={user} size="md" editable={false} />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                <Shield className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Back to Home Link */}
      {isExpanded && (
        <a
          href="/"
          className="mb-4 flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 text-white"
        >
          <Car className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </a>
      )}

      <nav className="space-y-2 flex-1">
        {mainItems.map(it => {
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => handleItemClick(it.id)}
              title={isExpanded ? '' : it.label}
              className={`w-full flex items-center ${isExpanded ? 'gap-3' : ''} p-3 rounded transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${current === it.id ? 'bg-purple-600/20 text-white' : 'text-white hover:bg-white/5'} ${isExpanded ? 'justify-start' : 'justify-center'}`}
            >
              <Icon className={`${iconSize} stroke-current transform-gpu transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`} />
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>{it.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <button
          onClick={() => handleItemClick('logout')}
          title={isExpanded ? '' : logoutItem.label}
          className={`w-full flex items-center ${isExpanded ? 'gap-3' : ''} p-3 rounded transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] text-red-300 hover:bg-red-500/10 ${isExpanded ? 'justify-start' : 'justify-center'}`}
        >
          <LogoutIcon className={`${iconSize} stroke-current transform-gpu transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`} />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>{logoutItem.label}</span>
        </button>
      </div>
    </div>
  );
};

AdminSidebar.propTypes = {
  current: PropTypes.string.isRequired,
  setCurrent: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  toggleExpanded: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default AdminSidebar;
