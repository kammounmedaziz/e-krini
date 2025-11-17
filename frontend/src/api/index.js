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
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user silently
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Dispatch auth change event
        window.dispatchEvent(new Event('authChange'));
        
        // Only redirect if not already on home page
        if (window.location.pathname !== '/') {
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

  loginWithFace: async (imageData) => {
    const response = await api.post('/auth/login-face', { imageData });
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
};

export default api;
