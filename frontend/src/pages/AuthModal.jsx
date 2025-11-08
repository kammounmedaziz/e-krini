import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LoginForm, RegisterForm } from '@components/auth';

const AuthModal = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      await onLogin(data);
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setLoading(true);
    try {
      await onRegister(data);
      onClose();
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
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
          className="absolute -top-4 -right-4 bg-dark-800 p-2 rounded-full text-gray-400 hover:text-white hover:bg-red-600 transition-all duration-300 z-20"
        >
          <X size={20} />
        </button>

        {/* Form */}
        {mode === 'login' ? (
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToRegister={() => setMode('register')}
            loading={loading}
          />
        ) : (
          <RegisterForm
            onSubmit={handleRegister}
            onSwitchToLogin={() => setMode('login')}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
