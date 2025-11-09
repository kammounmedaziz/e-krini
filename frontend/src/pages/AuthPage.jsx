import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LoginForm, RegisterForm } from '@components/auth';
import { Car, Zap } from 'lucide-react';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      let endpoint = '/api/v1/auth/login';
      let payload = data;

      // Check if this is face authentication
      if (data.faceAuth) {
        endpoint = '/api/v1/auth/login-face';
        payload = {}; // Face auth doesn't need additional payload
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        console.log('Authentication successful');
        // Handle successful authentication (store tokens, redirect, etc.)
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        // You can add navigation logic here
      } else {
        throw new Error(result.error?.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      // You can show error messages to the user here
      alert(`Authentication failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setLoading(true);
    try {
      let endpoint = '/api/auth/register';
      let payload = data;

      // Check if face auth is enabled
      if (data.enableFaceAuth) {
        endpoint = '/api/auth/register-face';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        console.log('Registration successful');
        // Handle successful registration (store tokens, redirect, etc.)
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        // You can add navigation logic here
      } else {
        throw new Error(result.error?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      // You can show error messages to the user here
      alert(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-cyan rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-primary-600 to-accent-cyan p-3 rounded-2xl">
                <Car className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-cyan bg-clip-text text-transparent">
              E-Krini
            </h1>
            <Zap className="w-5 h-5 text-accent-cyan animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Please sign in to continue</p>
        </motion.div>

        {/* Auth Forms */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
          transition={{ duration: 0.3 }}
          className="bg-dark-800/50 backdrop-blur-lg border border-dark-700 rounded-2xl p-8 shadow-2xl"
        >
          {mode === 'login' ? (
            <LoginForm
              onSubmit={handleLogin}
              loading={loading}
              onSwitchToRegister={() => setMode('register')}
            />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              loading={loading}
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-gray-500 text-sm">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthPage;