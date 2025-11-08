import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Footer } from '@components/shared';
import LandingPage from '@pages/LandingPage';
import AboutPage from '@pages/AboutPage';
import TeamPage from '@pages/TeamPage';
import AuthModal from '@pages/AuthModal';
import { Loading } from '@ui';
import { authAPI } from '@api';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };

    checkAuth();
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

  if (loading) {
    return <Loading fullScreen size="lg" text="Loading E-Krini..." />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-dark-900 text-white">
        <Navbar
          onAuthClick={() => setIsAuthModalOpen(true)}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />
        
        <Routes>
          <Route
            path="/"
            element={<LandingPage onGetStarted={() => setIsAuthModalOpen(true)} />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
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
    </Router>
  );
}

export default App;
