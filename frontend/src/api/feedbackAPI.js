import axios from 'axios';
import api from './index.js';

const FEEDBACK_BASE_URL = 'http://localhost:3000/api';

// Use the main api instance instead of creating a new one
const feedbackApi = api;

export const feedbackAPI = {
  // User endpoints
  createFeedback: async (data) => {
    const response = await feedbackApi.post('/feedback', data);
    return response.data;
  },

  getMyFeedback: async (params = {}) => {
    const response = await feedbackApi.get('/feedback/my-feedback', { params });
    return response.data;
  },

  getFeedbackById: async (id) => {
    const response = await feedbackApi.get(`/feedback/${id}`);
    return response.data;
  },

  rateFeedback: async (id, rating) => {
    const response = await feedbackApi.patch(`/feedback/${id}/rate`, { rating });
    return response.data;
  },

  deleteFeedback: async (id) => {
    const response = await feedbackApi.delete(`/feedback/${id}`);
    return response.data;
  },

  // Admin endpoints
  getAllFeedback: async (params = {}) => {
    const response = await feedbackApi.get('/feedback', { params });
    return response.data;
  },

  updateFeedback: async (id, data) => {
    const response = await feedbackApi.patch(`/feedback/${id}`, data);
    return response.data;
  },

  respondToFeedback: async (id, message) => {
    const response = await feedbackApi.post(`/feedback/${id}/respond`, { message });
    return response.data;
  },

  resolveFeedback: async (id, message) => {
    const response = await feedbackApi.post(`/feedback/${id}/resolve`, { message });
    return response.data;
  },

  addInternalNote: async (id, note) => {
    const response = await feedbackApi.post(`/feedback/${id}/notes`, { note });
    return response.data;
  },

  getStatistics: async (params = {}) => {
    const response = await feedbackApi.get('/feedback/admin/statistics', { params });
    return response.data;
  },
};

export default feedbackAPI;
