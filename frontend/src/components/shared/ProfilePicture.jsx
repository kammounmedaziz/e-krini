import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { userAPI } from '@api';
import toast from 'react-hot-toast';

const ProfilePicture = ({ user, size = 'md', editable = false, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    '2xl': 'w-40 h-40'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setShowOptions(false);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const imageData = reader.result;
          console.log('📤 Uploading profile picture...');
          const response = await userAPI.uploadProfilePicture(imageData);

          if (response.success) {
            toast.success('Profile picture updated successfully!');
            
            // Update localStorage
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            userData.profilePicture = response.data.profilePicture;
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Callback to parent component
            if (onUpdate) {
              onUpdate(response.data.profilePicture);
            }

            // Trigger a storage event to update other components
            window.dispatchEvent(new Event('storage'));
            
            // Also trigger auth change to update header
            window.dispatchEvent(new Event('authChange'));
          }
        } catch (error) {
          console.error('❌ Upload error:', error);
          const errorMsg = error.response?.data?.error?.message || error.message || 'Failed to upload profile picture';
          toast.error(errorMsg);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File read error:', error);
      toast.error('Failed to read image file');
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setIsUploading(true);
    setShowOptions(false);

    try {
      const response = await userAPI.deleteProfilePicture();
      
      if (response.success) {
        toast.success('Profile picture removed successfully');
        
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.profilePicture = null;
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Callback to parent component
        if (onUpdate) {
          onUpdate(null);
        }

        // Trigger events to update other components
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('authChange'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Profile Picture */}
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-300 dark:border-dark-600 bg-gray-100 dark:bg-dark-800 flex items-center justify-center ${isUploading ? 'opacity-50' : ''}`}>
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.username || 'Profile'}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className={`${iconSizes[size]} text-gray-400 dark:text-gray-600`} />
        )}
      </div>

      {/* Edit Button */}
      {editable && !isUploading && (
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="absolute bottom-0 right-0 p-1.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors shadow-lg"
          title="Edit profile picture"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Loading Spinner */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Options Menu */}
      {showOptions && editable && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-dark-600 z-50 overflow-hidden">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
            >
              <Upload className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload Photo
              </span>
            </button>
            
            {user?.profilePicture && (
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors border-t border-gray-100 dark:border-dark-700"
              >
                <X className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Remove Photo
                </span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePicture;
