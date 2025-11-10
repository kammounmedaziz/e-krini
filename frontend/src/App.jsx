import React, { useState, useEffect } from 'react';
import LandingPage from '@pages/LandingPage';
import AuthModal from '@pages/AuthModal';
import { authAPI } from '@api';
import toast, { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@context/ThemeContext';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [resetToken, setResetToken] = useState('');

  // Check if user is logged in on mount and handle password reset token
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
    };

    const handlePasswordResetToken = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        setResetToken(token);
        setIsAuthModalOpen(true);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    const handleSocialLoginSuccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('accessToken');
      const refreshToken = urlParams.get('refreshToken');
      const userData = urlParams.get('user');

      if (accessToken && refreshToken && userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData));
          
          // Store tokens and user data
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          
          setIsAuthenticated(true);
          setUser(user);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          toast.success('Successfully logged in!');
        } catch (error) {
          console.error('Error parsing social login data:', error);
          toast.error('Login failed. Please try again.');
        }
      }
    };

    checkAuth();
    handlePasswordResetToken();
    handleSocialLoginSuccess();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { accessToken, refreshToken, user: userData } = response.data;
        
        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setIsAuthenticated(true);
        setUser(userData);
        setIsAuthModalOpen(false);
        
        toast.success(response.message || 'Login successful!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { accessToken, refreshToken, user: newUser } = response.data;
        
        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        setIsAuthenticated(true);
        setUser(newUser);
        setIsAuthModalOpen(false);
        
        toast.success(response.message || 'Registration successful!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Registration failed. Please try again.';
      const details = error.response?.data?.error?.details;
      
      if (details && Array.isArray(details)) {
        details.forEach(detail => toast.error(detail.msg));
      } else {
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      setIsAuthenticated(false);
      setUser(null);
      
      toast.success('Logged out successfully');
    }
  };

 

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white transition-colors duration-300">
        <LandingPage 
          showWelcome={showWelcome} 
          setShowWelcome={setShowWelcome}
          onAuthClick={() => setIsAuthModalOpen(true)}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          resetToken={resetToken}
        />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#0ea5e9',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
