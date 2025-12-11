import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from '@pages/LandingPage';
import AuthModal from '@pages/AuthModal';
import ClientDashboardLayout from '@pages/client/ClientDashboardLayout';
import AdminDashboardLayout from '@pages/admin/AdminDashboardLayout';
import AgencyDashboardLayout from '@pages/agency/AgencyDashboardLayout';
import InsuranceDashboardLayout from '@pages/insurance/InsuranceDashboardLayout';
import { authAPI } from '@api';
import toast, { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@context/ThemeContext';

// Main App Content Component (can use useNavigate)
function AppContent() {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount and when storage changes
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        // Skip token validation for now - just trust stored data
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    // Check on mount
    checkAuth();

    // Listen for storage changes (when another tab/page logs in)
    window.addEventListener('storage', checkAuth);

    // Custom event for same-page login/logout
    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  const redirectBasedOnRole = (user) => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'client') {
      navigate('/client/dashboard');
    } else if (user?.role === 'agency') {
      navigate('/agency/dashboard');
    } else if (user?.role === 'insurance') {
      navigate('/insurance/dashboard');
    } else {
      navigate('/');
    }
  };

  // Handle login redirects
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      const currentPath = window.location.pathname;
      
      // If we're on the landing page after login, redirect to dashboard
      if (currentPath === '/') {
        redirectBasedOnRole(user);
      }
    }
  }, [isAuthenticated, user, isLoading]);

  const handleLogin = async (credentials) => {
    try {
      let response;
      
      // Check if it's face authentication
      if (credentials.faceAuth) {
        // Face authentication - extract username/email from the success data
        response = credentials; // This comes from FaceAuth component
      } else {
        // Regular password login
        response = await authAPI.login(credentials);
      }

      console.log('Login response:', response);

      if (response.success) {
        const { accessToken, refreshToken, user: userData } = response.data;

        console.log('User data from response:', userData);

        // Store tokens and user data FIRST
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Update state
        setIsAuthenticated(true);
        setUser(userData);
        setIsAuthModalOpen(false);

        // Dispatch auth change event
        window.dispatchEvent(new Event('authChange'));

        toast.success(response.message || 'Login successful!');

        // Let the useEffect handle the redirect after state updates
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

        // Let the useEffect handle the redirect after state updates
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
    console.log('handleLogout called in App.jsx');
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

      // Dispatch custom event to notify other components about auth change
      window.dispatchEvent(new Event('authChange'));

      toast.success('Logged out successfully');

      // Redirect to home page
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white transition-colors duration-300">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <LandingPage
              showWelcome={showWelcome}
              setShowWelcome={setShowWelcome}
              onAuthClick={() => setIsAuthModalOpen(true)}
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={handleLogout}
            />
          }
        />

        {/* Protected dashboard routes */}
        <Route
          path="/client/dashboard"
          element={
            isAuthenticated && user?.role === 'client' ? (
              <ClientDashboardLayout user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminDashboardLayout user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/agency/dashboard"
          element={
            isAuthenticated && user?.role === 'agency' ? (
              <AgencyDashboardLayout user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/insurance/dashboard"
          element={
            isAuthenticated && user?.role === 'insurance' ? (
              <InsuranceDashboardLayout user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      )}

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
  );
}

// Main App Component
function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;