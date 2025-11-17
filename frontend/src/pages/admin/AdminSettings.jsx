import React, { useState } from 'react';
import { Card, Button } from '@ui';
import {
  Shield,
  Key,
  Users,
  Database,
  Bell,
  Lock,
  CheckCircle,
  AlertTriangle,
  Server,
  Eye,
  Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    twoFactorEnabled: true,
    auditLogging: true,
    emailNotifications: true,
    systemAlerts: true,
    maintenanceMode: false,
    apiRateLimiting: true,
    dataEncryption: true,
    backupEnabled: true
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSettingChange = async (settingKey, value) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSettings(prev => ({
        ...prev,
        [settingKey]: value
      }));

      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const securityOptions = [
    {
      id: 'twoFactor',
      title: 'Admin Two-Factor Authentication',
      description: 'Require 2FA for all admin accounts',
      icon: Smartphone,
      enabled: settings.twoFactorEnabled,
      onToggle: () => handleSettingChange('twoFactorEnabled', !settings.twoFactorEnabled),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      required: true
    },
    {
      id: 'auditLogging',
      title: 'Audit Logging',
      description: 'Log all admin actions for security monitoring',
      icon: Eye,
      enabled: settings.auditLogging,
      onToggle: () => handleSettingChange('auditLogging', !settings.auditLogging),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      required: true
    },
    {
      id: 'apiRateLimiting',
      title: 'API Rate Limiting',
      description: 'Prevent API abuse with rate limiting',
      icon: Server,
      enabled: settings.apiRateLimiting,
      onToggle: () => handleSettingChange('apiRateLimiting', !settings.apiRateLimiting),
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      required: false
    },
    {
      id: 'dataEncryption',
      title: 'Data Encryption',
      description: 'Encrypt sensitive data at rest and in transit',
      icon: Lock,
      enabled: settings.dataEncryption,
      onToggle: () => handleSettingChange('dataEncryption', !settings.dataEncryption),
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      required: true
    },
    {
      id: 'backupEnabled',
      title: 'Automated Backups',
      description: 'Daily automated database backups',
      icon: Database,
      enabled: settings.backupEnabled,
      onToggle: () => handleSettingChange('backupEnabled', !settings.backupEnabled),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      required: true
    }
  ];

  const systemOptions = [
    {
      id: 'maintenanceMode',
      title: 'Maintenance Mode',
      description: 'Put the system in maintenance mode',
      enabled: settings.maintenanceMode,
      onToggle: () => handleSettingChange('maintenanceMode', !settings.maintenanceMode),
      warning: 'This will disable user access to the platform'
    }
  ];

  const notificationOptions = [
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive system alerts via email',
      enabled: settings.emailNotifications,
      onToggle: () => handleSettingChange('emailNotifications', !settings.emailNotifications)
    },
    {
      id: 'systemAlerts',
      title: 'System Alerts',
      description: 'Get notified of critical system events',
      enabled: settings.systemAlerts,
      onToggle: () => handleSettingChange('systemAlerts', !settings.systemAlerts)
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          System Administration
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage system security, performance, and administrative settings
        </p>
      </div>

      {/* Security Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Security Configuration
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Critical security settings for the platform
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {securityOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${option.bgColor}`}>
                  <option.icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {option.title}
                    </h3>
                    {option.required && (
                      <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {option.enabled && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <button
                  onClick={option.onToggle}
                  disabled={isLoading || (option.required && !option.enabled)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${option.enabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-dark-600'}
                    ${(isLoading || (option.required && !option.enabled)) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${option.enabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <Server className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              System Configuration
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Platform-wide system settings
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {systemOptions.map((option) => (
            <div key={option.id} className={`p-4 border rounded-lg ${
              option.enabled
                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                : 'border-gray-200 dark:border-dark-700'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${
                    option.enabled ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-white'
                  }`}>
                    {option.title}
                  </h3>
                  <p className={`text-sm ${
                    option.enabled ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {option.description}
                  </p>
                  {option.warning && option.enabled && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {option.warning}
                    </p>
                  )}
                </div>

                <button
                  onClick={option.onToggle}
                  disabled={isLoading}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${option.enabled ? 'bg-red-600' : 'bg-gray-200 dark:bg-dark-600'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${option.enabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Bell className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Notification Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Configure system notifications and alerts
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-700 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </p>
              </div>

              <button
                onClick={option.onToggle}
                disabled={isLoading}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${option.enabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-dark-600'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${option.enabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* System Health */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              System Health Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Current status of system components
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100">Database</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Operational</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100">API Services</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Online</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Backup</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Last: 2h ago</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100">Security</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Protected</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" disabled={isLoading}>
          Reset to Defaults
        </Button>
        <Button variant="primary" disabled={isLoading}>
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;