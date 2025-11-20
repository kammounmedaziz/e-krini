import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only try to refresh token if:
    // 1. Response is 401
    // 2. We haven't already tried to retry
    // 3. The original request was NOT a login/register/refresh-token request
    // 4. We actually have a refresh token
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh-token');
    
    const refreshToken = localStorage.getItem('refreshToken');

    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !isAuthEndpoint && 
        refreshToken) {
      originalRequest._retry = true;

      try {
        console.log('🔄 Attempting to refresh token...');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        console.log('✅ Token refreshed successfully, retrying original request');
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Refresh failed, logout user silently
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Dispatch auth change event
        window.dispatchEvent(new Event('authChange'));
        
        // Only redirect if not already on home page or auth page
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && !currentPath.startsWith('/auth')) {
          console.log('🔄 Redirecting to home page due to auth failure');
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Face Authentication
  enableFaceAuth: async (userId) => {
    const response = await api.post('/auth/enable-face-auth', { userId });
    return response.data;
  },

  loginWithFace: async (imageData, username = null) => {
    const payload = { imageData };
    if (username) {
      payload.username = username;
    }
    const response = await api.post('/auth/login-face', payload);
    return response.data;
  },

  // Face Image Management
  getFaceImages: async () => {
    const response = await api.get('/auth/face-images');
    return response.data;
  },

  deleteFaceImage: async (imageId) => {
    const response = await api.delete(`/auth/face-images/${imageId}`);
    return response.data;
  },

  // Social Login
  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  facebookLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/facebook`;
  },
};

// User API endpoints
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  uploadProfilePicture: async (imageData) => {
    const response = await api.post('/users/profile/picture', { imageData });
    return response.data;
  },

  deleteProfilePicture: async () => {
    const response = await api.delete('/users/profile/picture');
    return response.data;
  },
};

// Admin API endpoints
export const adminAPI = {
  // User Management
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, data) => {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // User Status Management
  banUser: async (userId, reason) => {
    const response = await api.post(`/admin/users/${userId}/ban`, { reason });
    return response.data;
  },

  unbanUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/unban`);
    return response.data;
  },

  changeUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Statistics & Reports
  getUserStatistics: async () => {
    const response = await api.get('/admin/users/statistics');
    return response.data;
  },

  exportUsersToCSV: async (params = {}) => {
    const response = await api.get('/admin/users/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Bulk Operations
  bulkDeleteUsers: async (userIds) => {
    const response = await api.post('/admin/users/bulk/delete', { userIds });
    return response.data;
  },

  bulkUpdateRole: async (userIds, role) => {
    const response = await api.post('/admin/users/bulk/role', { userIds, role });
    return response.data;
  },

  bulkBanUsers: async (userIds, reason) => {
    const response = await api.post('/admin/users/bulk/ban', { userIds, reason });
    return response.data;
  },
};

export default api;
