import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Camera } from 'lucide-react';
import { Input, Button, Card } from '@ui';
import FaceAuth from './FaceAuth';
import SocialLogin from './SocialLogin';

const LoginForm = ({ onSubmit, onSwitchToRegister, onForgotPassword, loading = false }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authMode, setAuthMode] = useState('password'); // 'password' or 'face'

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username or email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleFaceAuthSuccess = (faceData) => {
    // Handle successful face authentication
    onSubmit({ faceAuth: true, ...faceData });
  };

  const handleFaceAuthError = (error) => {
    setErrors({ face: error });
  };

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Welcome Back</h2>
        <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
      </div>

      {/* Auth Mode Toggle */}
      <div className="flex rounded-lg bg-gray-100 dark:bg-dark-800 p-1 mb-6">
        <button
          type="button"
          onClick={() => setAuthMode('password')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            authMode === 'password'
              ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('face')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            authMode === 'face'
              ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4 inline mr-1" />
          Face
        </button>
      </div>

      {authMode === 'password' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username or Email"
            name="username"
            type="text"
            placeholder="Enter your username or email"
            icon={User}
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            disabled={loading}
          />

          <div className="relative">
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <input 
                type="checkbox" 
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="rounded" 
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-primary-500 hover:text-primary-400"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
          >
            Sign In
          </Button>
        </form>
      ) : (
        <FaceAuth
          mode="login"
          onSuccess={handleFaceAuthSuccess}
          onError={handleFaceAuthError}
        />
      )}

      {/* Social Login */}
      <SocialLogin onSocialLogin={() => {}} loading={loading} />

      <div className="text-center text-gray-600 dark:text-gray-400 mt-4">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary-500 hover:text-primary-400 font-semibold"
        >
          Sign Up
        </button>
      </div>
    </Card>
  );
};

export default LoginForm;
