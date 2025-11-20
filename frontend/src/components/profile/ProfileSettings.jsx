import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@ui';
import ProfilePicture from '../shared/ProfilePicture';
import { User, Mail, Shield, Save } from 'lucide-react';
import { userAPI } from '@api';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    loadUserData();
    
    // Listen for profile picture updates
    const handleStorageChange = () => {
      loadUserData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadUserData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
      setFormData({
        username: userData.username || '',
        email: userData.email || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleProfilePictureUpdate = (newProfilePicture) => {
    setUser(prev => ({ ...prev, profilePicture: newProfilePicture }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await userAPI.updateProfile(formData);
      
      if (response.success) {
        toast.success('Profile updated successfully!');
        
        // Update localStorage
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Trigger storage event
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information and profile picture
        </p>
      </div>

      {/* Profile Picture Section */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Profile Picture
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Upload or change your profile picture
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
          <ProfilePicture 
            user={user} 
            size="2xl" 
            editable={true}
            onUpdate={handleProfilePictureUpdate}
          />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {user?.username || 'User'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Click the camera icon to upload a new profile picture
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>• JPG, PNG or GIF</span>
              <span>• Max 5MB</span>
              <span>• Recommended: 400x400px</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Account Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Update your account details
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="pl-10"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="pl-10"
              />
            </div>
          </div>

          {/* Role Badge */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Role
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your current account type
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Client'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="min-w-[200px]"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfileSettings;
