import React from 'react';
import PropTypes from 'prop-types';
import {
  Home,
  Car,
  Calendar,
  CreditCard,
  MapPin,
  Star,
  MessageSquare,
  Settings,
  LogOut,
  Menu
} from 'lucide-react';

const ClientSidebar = ({ current, setCurrent, isExpanded, toggleExpanded, onLogout }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'cars', label: 'My Cars', icon: Car },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
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
          <h2 className="text-xl font-bold text-white">Client Hub</h2>
        </div>
        <button onClick={toggleExpanded} className="text-white hover:text-gray-300 p-1">
          <Menu className={`stroke-current origin-center transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${iconSize} ${isExpanded ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>

      <nav className="space-y-2 flex-1">
        {mainItems.map(it => {
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => handleItemClick(it.id)}
              title={isExpanded ? '' : it.label}
              className={`w-full flex items-center ${isExpanded ? 'gap-3' : ''} p-3 rounded transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${current === it.id ? 'bg-cyan-600/20 text-white' : 'text-white hover:bg-white/5'} ${isExpanded ? 'justify-start' : 'justify-center'}`}
            >
              <Icon className={`${iconSize} stroke-current transform-gpu transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`} />
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button
          onClick={() => handleItemClick(logoutItem.id)}
          title={isExpanded ? '' : logoutItem.label}
          className={`w-full flex items-center ${isExpanded ? 'gap-3' : ''} p-3 rounded transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${current === logoutItem.id ? 'bg-cyan-600/20 text-white' : 'text-white hover:bg-white/5'} ${isExpanded ? 'justify-start' : 'justify-center'}`}
        >
          <LogoutIcon className={`${iconSize} stroke-current transform-gpu transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`} />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>{logoutItem.label}</span>
        </button>
      </div>
    </div>
  );
};

ClientSidebar.propTypes = {
  current: PropTypes.string.isRequired,
  setCurrent: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  toggleExpanded: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default ClientSidebar;