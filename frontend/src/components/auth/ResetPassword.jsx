import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Input, Button, Card } from '@ui';
import { authAPI } from '@api';
import toast from 'react-hot-toast';

const ResetPassword = ({ token, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    // Validate token on component mount
    if (!token) {
      setTokenValid(false);
      setErrors({ token: 'Invalid or missing reset token' });
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !tokenValid) return;

    setLoading(true);
    try {
      const response = await authAPI.resetPassword(token, formData.password);
      if (response.success) {
        toast.success(response.message || 'Password reset successfully!');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <Card className="w-full max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Button
            onClick={onBack}
            variant="primary"
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Reset Password</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="New Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
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
            placeholder="Confirm new password"
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

        {errors.general && (
          <div className="text-red-500 text-sm text-center">
            {errors.general}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          Reset Password
        </Button>
      </form>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-primary-500 hover:text-primary-400 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </button>
      </div>
    </Card>
  );
};

export default ResetPassword;