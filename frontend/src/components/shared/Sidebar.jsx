import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@ui';
import ProfilePicture from './ProfilePicture';
import {
  LayoutDashboard,
  Car,
  Users,
  Settings,
  BarChart3,
  FileText,
  Shield,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({
  isOpen,
  onToggle,
  navigation,
  user,
  onLogout,
  theme = 'client'
}) => {
  const location = useLocation();

  const themeColors = {
    client: {
      primary: 'from-blue-600 to-cyan-500',
      hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      active: 'bg-blue-100 dark:bg-blue-900/40 border-blue-500',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    admin: {
      primary: 'from-purple-600 to-pink-500',
      hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
      active: 'bg-purple-100 dark:bg-purple-900/40 border-purple-500',
      icon: 'text-purple-600 dark:text-purple-400'
    }
  };

  const colors = themeColors[theme];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-gradient-to-r ${colors.primary} rounded-lg`}>
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">
                  {theme === 'client' ? 'Client Hub' : 'Admin Hub'}
                </h2>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* User Profile Section */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
            <ProfilePicture user={user} size="md" editable={false} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.username || user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          
          {/* Home Link */}
          <a
            href="/"
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
          >
            <Car className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? `${colors.active} ${colors.icon} border-l-4`
                    : `text-gray-700 dark:text-gray-300 ${colors.hover}`
                  }
                `}
                onClick={() => window.innerWidth < 1024 && onToggle()}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;