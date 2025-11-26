import axios from 'axios';
import api from './index.js';

const FEEDBACK_BASE_URL = 'http://localhost:3007/api/feedback';

// Create axios instance for feedback service
const feedbackApi = axios.create({
  baseURL: FEEDBACK_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
feedbackApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const feedbackAPI = {
  // User endpoints
  createFeedback: async (data) => {
    const response = await feedbackApi.post('/', data);
    return response.data;
  },

  getMyFeedback: async (params = {}) => {
    const response = await feedbackApi.get('/my-feedback', { params });
    return response.data;
  },

  getFeedbackById: async (id) => {
    const response = await feedbackApi.get(`/${id}`);
    return response.data;
  },

  rateFeedback: async (id, rating) => {
    const response = await feedbackApi.patch(`/${id}/rate`, { rating });
    return response.data;
  },

  deleteFeedback: async (id) => {
    const response = await feedbackApi.delete(`/${id}`);
    return response.data;
  },

  // Admin endpoints
  getAllFeedback: async (params = {}) => {
    const response = await feedbackApi.get('/', { params });
    return response.data;
  },

  updateFeedback: async (id, data) => {
    const response = await feedbackApi.patch(`/${id}`, data);
    return response.data;
  },

  respondToFeedback: async (id, message) => {
    const response = await feedbackApi.post(`/${id}/respond`, { message });
    return response.data;
  },

  resolveFeedback: async (id, message) => {
    const response = await feedbackApi.post(`/${id}/resolve`, { message });
    return response.data;
  },

  addInternalNote: async (id, note) => {
    const response = await feedbackApi.post(`/${id}/notes`, { note });
    return response.data;
  },

  getStatistics: async (params = {}) => {
    const response = await feedbackApi.get('/admin/statistics', { params });
    return response.data;
  },
};

export default feedbackAPI;
