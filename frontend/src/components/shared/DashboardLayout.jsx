import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProfilePicture from './ProfilePicture';
import { Button } from '@ui';
import { Menu, Bell } from 'lucide-react';
import { useTheme } from '@context/ThemeContext';

const DashboardLayout = ({
  navigation,
  user,
  onLogout,
  theme = 'client',
  title = 'Dashboard'
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme: appTheme } = useTheme();

  const themeColors = {
    client: {
      primary: 'from-blue-600 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-900/10'
    },
    admin: {
      primary: 'from-purple-600 to-pink-500',
      bg: 'bg-purple-50 dark:bg-purple-900/10'
    }
  };

  const colors = themeColors[theme];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        navigation={navigation}
        user={user}
        onLogout={onLogout}
        theme={theme}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className={`bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 ${colors.bg}`}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Title */}
              <div className="flex-1 lg:flex-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* User menu */}
                <div className="flex items-center gap-3">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.username || user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <ProfilePicture user={user} size="md" editable={false} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;