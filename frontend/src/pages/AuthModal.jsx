import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LoginForm, RegisterForm, ForgotPassword, ResetPassword } from '@components/auth';

const AuthModal = ({ isOpen, onClose, onLogin, onRegister, resetToken: propResetToken }) => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle reset token from props
  useEffect(() => {
    if (propResetToken) {
      setResetToken(propResetToken);
      setMode('reset');
    }
  }, [propResetToken]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all state when modal closes
      setLoading(false);
      setMode('login');
      if (!propResetToken) {
        setResetToken('');
      }
    }
  }, [isOpen, propResetToken]);

  if (!isOpen) return null;

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      await onLogin(data);
      // Don't close here - let App.jsx handle it after redirect
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setLoading(true);
    try {
      await onRegister(data);
      // Don't close here - let App.jsx handle it after redirect
    } catch (error) {
      console.error('Registration failed:', error);
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setMode('forgot');
  };

  const handleForgotSuccess = () => {
    // Could show a success message or automatically go back to login
    setMode('login');
  };

  const handleResetPassword = (token) => {
    setResetToken(token);
    setMode('reset');
  };

  const handleResetSuccess = () => {
    setMode('login');
    if (!propResetToken) {
      setResetToken('');
    }
  };

  const handleBack = () => {
    setMode('login');
    if (!propResetToken) {
      setResetToken('');
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'register':
        return (
          <RegisterForm
            onSubmit={handleRegister}
            onSwitchToLogin={() => setMode('login')}
            loading={loading}
          />
        );
      case 'forgot':
        return (
          <ForgotPassword
            onBack={handleBack}
            onSuccess={handleForgotSuccess}
          />
        );
      case 'reset':
        return (
          <ResetPassword
            token={resetToken}
            onBack={handleBack}
            onSuccess={handleResetSuccess}
          />
        );
      default:
        return (
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToRegister={() => setMode('register')}
            onForgotPassword={handleForgotPassword}
            loading={loading}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-gray-200 dark:bg-dark-800 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-red-600 transition-all duration-300 z-20"
        >
          <X size={20} />
        </button>

        {/* Form */}
        {renderForm()}
      </div>
    </div>
  );
};

export default AuthModal;
