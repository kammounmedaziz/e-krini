import React, { useState, useEffect } from 'react';
import { Card, Button } from '@ui';
import FaceCaptureModal from '../../components/FaceCaptureModal';
import {
  Shield,
  Smartphone,
  Eye,
  Key,
  Bell,
  Lock,
  CheckCircle,
  AlertTriangle,
  Camera,
  Fingerprint
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, userAPI } from '@api';

const ClientSettings = () => {
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    faceAuthEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    biometricEnabled: false
  });

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFaceAuthLoading, setIsFaceAuthLoading] = useState(false);
  const [showFaceCaptureModal, setShowFaceCaptureModal] = useState(false);

  // Load user data and settings on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userData = localStorage.getItem('user');

        console.log('ClientSettings - Tokens check:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasUserData: !!userData
        });

        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('ClientSettings - Parsed user data:', parsedUser);
          setUser(parsedUser);
          setSettings(prev => ({
            ...prev,
            faceAuthEnabled: parsedUser.faceAuthEnabled || false,
            // You can add more settings here as they become available in the user model
          }));
        }

        // Also fetch fresh user data from API
        console.log('ClientSettings - Fetching fresh user data from API...');
        const response = await userAPI.getProfile();
        console.log('ClientSettings - API response:', response);

        if (response.success) {
          console.log('ClientSettings - Fresh user data:', response.data);
          setUser(response.data);
          setSettings(prev => ({
            ...prev,
            faceAuthEnabled: response.data.faceAuthEnabled || false,
          }));

          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('ClientSettings - Failed to load user data:', error);
        console.error('ClientSettings - Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error('Failed to load user settings');
      }
    };

    loadUserData();
  }, []);

  const handleSettingChange = async (settingKey, value) => {
    setIsLoading(true);
    try {
      // For face authentication, we need to call the API
      if (settingKey === 'faceAuthEnabled') {
        if (value) {
          // Show face capture modal for first-time setup
          setShowFaceCaptureModal(true);
          setIsLoading(false);
          return;
        } else {
          // For disabling face auth, update the user profile
          const response = await userAPI.updateSettings({ faceAuthEnabled: false });
          if (response.success) {
            setSettings(prev => ({ ...prev, [settingKey]: value }));
            // Update user data
            const updatedUser = { ...user, faceAuthEnabled: false };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success('Face authentication disabled successfully!');
          }
        }
      } else {
        // For other settings, just update locally for now
        // In a real app, you'd call an API to save these preferences
        setSettings(prev => ({ ...prev, [settingKey]: value }));
        toast.success('Settings updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to update settings';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsFaceAuthLoading(false);
    }
  };

  const handleFaceRegistrationComplete = async () => {
    try {
      // The face auth is already enabled by the FaceCaptureModal API call
      // Just update the local state and localStorage
      setSettings(prev => ({ ...prev, faceAuthEnabled: true }));
      const updatedUser = { ...user, faceAuthEnabled: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Face authentication enabled successfully!');
    } catch (error) {
      console.error('Failed to update local state:', error);
      toast.error('Face authentication setup completed, but failed to update settings locally.');
    }
  };

  const securityOptions = [
    {
      id: 'twoFactor',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      icon: Smartphone,
      enabled: settings.twoFactorEnabled,
      onToggle: () => handleSettingChange('twoFactorEnabled', !settings.twoFactorEnabled),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      id: 'faceAuth',
      title: 'Face Authentication',
      description: 'Use facial recognition for quick login',
      icon: Eye,
      enabled: settings.faceAuthEnabled,
      onToggle: () => handleSettingChange('faceAuthEnabled', !settings.faceAuthEnabled),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      loading: isFaceAuthLoading
    },
    {
      id: 'biometric',
      title: 'Biometric Login',
      description: 'Use fingerprint or face ID on supported devices',
      icon: Fingerprint,
      enabled: settings.biometricEnabled,
      onToggle: () => handleSettingChange('biometricEnabled', !settings.biometricEnabled),
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    }
  ];

  const notificationOptions = [
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive booking confirmations and updates via email',
      enabled: settings.emailNotifications,
      onToggle: () => handleSettingChange('emailNotifications', !settings.emailNotifications)
    },
    {
      id: 'smsNotifications',
      title: 'SMS Notifications',
      description: 'Get important alerts via text message',
      enabled: settings.smsNotifications,
      onToggle: () => handleSettingChange('smsNotifications', !settings.smsNotifications)
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Security & Preferences
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account security and notification preferences
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
              Security Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enhance your account protection
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
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {option.title}
                  </h3>
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
                  disabled={isLoading || option.loading}
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
                  {(isLoading || option.loading) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Face Authentication Setup */}
        {settings.faceAuthEnabled && (
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Camera className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                Face Authentication Setup
              </h3>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
              Set up facial recognition for faster login. You'll need to allow camera access.
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={isFaceAuthLoading}
              className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20 disabled:opacity-50"
              onClick={async () => {
                try {
                  setIsFaceAuthLoading(true);
                  // This would typically open a camera interface for face registration
                  // For now, we'll just show a success message
                  toast.success('Face authentication setup completed!');
                } catch (error) {
                  toast.error('Failed to setup face authentication');
                } finally {
                  setIsFaceAuthLoading(false);
                }
              }}
            >
              {isFaceAuthLoading ? (
                <>
                  <div className="w-4 h-4 border border-purple-700 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Setting up...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Setup Face ID
                </>
              )}
            </Button>
          </div>
        )}

        {/* 2FA Setup */}
        {settings.twoFactorEnabled && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Two-Factor Authentication Setup
              </h3>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Scan the QR code with your authenticator app to enable 2FA.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Setup 2FA
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Disable 2FA
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Notification Preferences */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Bell className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Notification Preferences
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose how you want to be notified
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

      {/* Account Security Status */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <Lock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Account Security Status
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Current security level of your account
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900 dark:text-green-100">
                Password Strength
              </span>
            </div>
            <span className="text-sm text-green-700 dark:text-green-300 font-semibold">
              Strong
            </span>
          </div>

          <div className={`flex items-center justify-between p-4 border rounded-lg ${
            settings.twoFactorEnabled
              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
              : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className="flex items-center gap-3">
              {settings.twoFactorEnabled ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
              <span className={`font-medium ${
                settings.twoFactorEnabled
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-yellow-900 dark:text-yellow-100'
              }`}>
                Two-Factor Authentication
              </span>
            </div>
            <span className={`text-sm font-semibold ${
              settings.twoFactorEnabled
                ? 'text-green-700 dark:text-green-300'
                : 'text-yellow-700 dark:text-yellow-300'
            }`}>
              {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className={`flex items-center justify-between p-4 border rounded-lg ${
            settings.faceAuthEnabled
              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
              : 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800'
          }`}>
            <div className="flex items-center gap-3">
              {settings.faceAuthEnabled ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-gray-600" />
              )}
              <span className={`font-medium ${
                settings.faceAuthEnabled
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                Face Authentication
              </span>
            </div>
            <span className={`text-sm font-semibold ${
              settings.faceAuthEnabled
                ? 'text-green-700 dark:text-green-300'
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {settings.faceAuthEnabled ? 'Enabled' : 'Optional'}
            </span>
          </div>
        </div>
      </Card>

      {/* Face Capture Modal */}
      <FaceCaptureModal
        isOpen={showFaceCaptureModal}
        onClose={() => setShowFaceCaptureModal(false)}
        onComplete={handleFaceRegistrationComplete}
      />
    </div>
  );
};

export default ClientSettings;