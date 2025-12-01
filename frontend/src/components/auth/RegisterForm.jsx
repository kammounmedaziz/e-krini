import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Shield, Camera } from 'lucide-react';
import { Input, Button, Card } from '@ui';
import FaceAuth from './FaceAuth';
import SocialLogin from './SocialLogin';

const RegisterForm = ({ onSubmit, onSwitchToLogin, loading = false }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [enableFaceAuth, setEnableFaceAuth] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = 'Username must be between 3 and 20 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with 1 letter, 1 number, and 1 special character';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const { confirmPassword, ...submitData } = formData;
      onSubmit({
        ...submitData,
        enableFaceAuth,
        faceAuthEnabled: enableFaceAuth
      });
    }
  };

  const handleFaceAuthToggle = (enabled) => {
    setEnableFaceAuth(enabled);
  };

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Create Account</h2>
        <p className="text-gray-600 dark:text-gray-400">Join us for an amazing journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          name="username"
          type="text"
          placeholder="Choose a username"
          icon={User}
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          disabled={loading}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={loading}
        />

        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
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

        <div className="relative">
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-300"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['client', 'agency', 'insurance', 'admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role }))}
                className={`
                  px-4 py-2 rounded-lg border transition-all duration-300
                  ${formData.role === role 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'bg-gray-100 dark:bg-dark-800 border-gray-300 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-primary-500'
                  }
                `}
                disabled={loading}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Face Authentication Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 text-gray-300">
              <Camera className="w-5 h-5" />
              <span className="text-sm font-medium">Enable Face Authentication</span>
            </label>
            <button
              type="button"
              onClick={() => setEnableFaceAuth(!enableFaceAuth)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableFaceAuth ? 'bg-primary-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableFaceAuth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {enableFaceAuth && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FaceAuth
                mode="register"
                onSuccess={handleFaceAuthToggle}
                onError={(error) => setErrors({ face: error })}
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          Create Account
        </Button>

        {/* Social Login */}
        <SocialLogin onSocialLogin={() => {}} loading={loading} />

        <div className="text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary-500 hover:text-primary-400 font-semibold"
          >
            Sign In
          </button>
        </div>
      </form>
    </Card>
  );
};

export default RegisterForm;
