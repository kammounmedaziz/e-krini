import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

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
    console.log('API Request - URL:', config.url);
    console.log('API Request - Method:', config.method);
    console.log('API Request - Token present:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request - Authorization header set');
    } else {
      console.log('API Request - No token found in localStorage');
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

  getProfile: async () => {
    const response = await api.get('/users/profile');
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

  enableFaceAuth: async (userId, faceEncoding) => {
    const response = await api.post('/auth/enable-face-auth', { userId, faceEncoding });
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

  // Agency Management
  getAllAgencies: async (params = {}) => {
    const response = await api.get('/admin/agencies', { params });
    return response.data;
  },

  getAgencyById: async (agencyId) => {
    const response = await api.get(`/admin/agencies/${agencyId}`);
    return response.data;
  },

  approveAgency: async (agencyId, notes) => {
    const response = await api.post(`/admin/agencies/${agencyId}/approve`, { notes });
    return response.data;
  },

  rejectAgency: async (agencyId, reason) => {
    const response = await api.post(`/admin/agencies/${agencyId}/reject`, { reason });
    return response.data;
  },

  suspendAgency: async (agencyId, reason) => {
    const response = await api.post(`/admin/agencies/${agencyId}/suspend`, { reason });
    return response.data;
  },

  deleteAgency: async (agencyId) => {
    const response = await api.delete(`/admin/agencies/${agencyId}`);
    return response.data;
  },

  getAgencyStatistics: async () => {
    const response = await api.get('/admin/agencies/statistics');
    return response.data;
  },

  // Insurance Management
  getAllInsurance: async (params = {}) => {
    const response = await api.get('/admin/insurance', { params });
    return response.data;
  },

  getInsuranceById: async (insuranceId) => {
    const response = await api.get(`/admin/insurance/${insuranceId}`);
    return response.data;
  },

  approveInsurance: async (insuranceId, notes) => {
    const response = await api.post(`/admin/insurance/${insuranceId}/approve`, { notes });
    return response.data;
  },

  rejectInsurance: async (insuranceId, reason) => {
    const response = await api.post(`/admin/insurance/${insuranceId}/reject`, { reason });
    return response.data;
  },

  suspendInsurance: async (insuranceId, reason) => {
    const response = await api.post(`/admin/insurance/${insuranceId}/suspend`, { reason });
    return response.data;
  },

  deleteInsurance: async (insuranceId) => {
    const response = await api.delete(`/admin/insurance/${insuranceId}`);
    return response.data;
  },

  getInsuranceStatistics: async () => {
    const response = await api.get('/admin/insurance/statistics');
    return response.data;
  },
};

// Agency API endpoints
export const agencyAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/agency/dashboard/stats');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/agency/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/agency/profile', data);
    return response.data;
  },

  uploadDocument: async (documentType, file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    const response = await api.post('/agency/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get('/agency/documents');
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await api.delete(`/agency/documents/${documentId}`);
    return response.data;
  },
};

// Insurance API endpoints
export const insuranceAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/insurance/dashboard/stats');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/insurance/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/insurance/profile', data);
    return response.data;
  },

  uploadDocument: async (documentType, file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    const response = await api.post('/insurance/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get('/insurance/documents');
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await api.delete(`/insurance/documents/${documentId}`);
    return response.data;
  },
};

// Fleet API endpoints
export const fleetAPI = {
  // Car Management
  getCars: async (params = {}) => {
    const response = await api.get('/fleet/cars', { params });
    return response.data;
  },

  getCarById: async (carId) => {
    const response = await api.get(`/fleet/cars/${carId}`);
    return response.data;
  },

  createCar: async (carData) => {
    const response = await api.post('/fleet/cars', carData);
    return response.data;
  },

  updateCar: async (carId, carData) => {
    const response = await api.patch(`/fleet/cars/${carId}`, carData);
    return response.data;
  },

  deleteCar: async (carId) => {
    const response = await api.delete(`/fleet/cars/${carId}`);
    return response.data;
  },

  // Car Search and Filtering
  searchCars: async (params = {}) => {
    const response = await api.get('/fleet/cars/search', { params });
    return response.data;
  },

  checkAvailability: async (availabilityData) => {
    const response = await api.post('/fleet/cars/availability', availabilityData);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/fleet/categories');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/fleet/categories', categoryData);
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/fleet/categories/${categoryId}`, categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/fleet/categories/${categoryId}`);
    return response.data;
  },

  // Maintenance
  getMaintenanceDue: async () => {
    const response = await api.get('/fleet/cars/maintenance/due');
    return response.data;
  },

  checkMaintenance: async () => {
    const response = await api.get('/fleet/cars/maintenance/check');
    return response.data;
  },

  // Pricing
  updateSeasonPricing: async (pricingData) => {
    const response = await api.post('/fleet/cars/pricing/update-season', pricingData);
    return response.data;
  },
};

// Reservation API endpoints
export const reservationAPI = {
  // Client Reservations
  createReservation: async (reservationData) => {
    const response = await api.post('/reservation/reservations', reservationData);
    return response.data;
  },

  getMyReservations: async (params = {}) => {
    const response = await api.get('/reservation/reservations/client/' + localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : '', { params });
    return response.data;
  },

  getReservationById: async (reservationId) => {
    const response = await api.get(`/reservation/reservations/${reservationId}`);
    return response.data;
  },

  updateReservation: async (reservationId, updateData) => {
    const response = await api.put(`/reservation/reservations/${reservationId}`, updateData);
    return response.data;
  },

  cancelReservation: async (reservationId, reason) => {
    const response = await api.put(`/reservation/reservations/${reservationId}/cancel`, { reason });
    return response.data;
  },

  confirmReservation: async (reservationId) => {
    const response = await api.put(`/reservation/reservations/${reservationId}/confirm`);
    return response.data;
  },

  // Admin Reservation Management
  getAllReservations: async (params = {}) => {
    const response = await api.get('/reservation/reservations', { params });
    return response.data;
  },

  getReservationsByStatus: async (status) => {
    const response = await api.get(`/reservation/reservations/status/${status}`);
    return response.data;
  },

  updateReservationStatus: async (reservationId, status, notes) => {
    const response = await api.put(`/reservation/reservations/${reservationId}/status`, { status, notes });
    return response.data;
  },

  getReservationStatistics: async () => {
    const response = await api.get('/reservation/reservations/stats/overview');
    return response.data;
  },

  searchByCarModel: async (model) => {
    const response = await api.get('/reservation/reservations/search/by-car-model', { params: { model } });
    return response.data;
  },

  checkAvailability: async (carId, startDate, endDate) => {
    const response = await api.get('/reservation/reservations/availability/check', { 
      params: { carId, startDate, endDate } 
    });
    return response.data;
  },

  // Contract Management
  createContract: async (contractData) => {
    const response = await api.post('/reservation/contracts', contractData);
    return response.data;
  },

  getContractById: async (contractId) => {
    const response = await api.get(`/reservation/contracts/${contractId}`);
    return response.data;
  },

  getMyContracts: async (clientId) => {
    const response = await api.get(`/reservation/contracts/client/${clientId}`);
    return response.data;
  },

  getContractsByStatus: async (status) => {
    const response = await api.get(`/reservation/contracts/status/${status}`);
    return response.data;
  },

  signContract: async (contractId, signatureData) => {
    const response = await api.post(`/reservation/contracts/${contractId}/sign`, signatureData);
    return response.data;
  },

  generateContractPDF: async (contractId) => {
    const response = await api.post(`/reservation/contracts/${contractId}/generate-pdf`);
    return response.data;
  },

  downloadContractPDF: async (contractId) => {
    const response = await api.get(`/reservation/contracts/${contractId}/download-pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  updateContractStatus: async (contractId, status) => {
    const response = await api.put(`/reservation/contracts/status/${contractId}`, { status });
    return response.data;
  },

  deleteContract: async (contractId) => {
    const response = await api.delete(`/reservation/contracts/${contractId}`);
    return response.data;
  },
};

// Promotion API endpoints
export const promotionAPI = {
  getActivePromotions: async () => {
    const response = await api.get('/promotion/active');
    return response.data;
  },

  getPromotionById: async (promotionId) => {
    const response = await api.get(`/promotion/${promotionId}`);
    return response.data;
  },

  createPromotion: async (promotionData) => {
    const response = await api.post('/promotion', promotionData);
    return response.data;
  },

  updatePromotion: async (promotionId, promotionData) => {
    const response = await api.put(`/promotion/${promotionId}`, promotionData);
    return response.data;
  },

  deletePromotion: async (promotionId) => {
    const response = await api.delete(`/promotion/${promotionId}`);
    return response.data;
  },

  // Coupons
  validateCoupon: async (couponCode, bookingData) => {
    const response = await api.post('/promotion/coupon/validate', { couponCode, ...bookingData });
    return response.data;
  },

  getCoupons: async (params = {}) => {
    const response = await api.get('/promotion/coupons', { params });
    return response.data;
  },

  createCoupon: async (couponData) => {
    const response = await api.post('/promotion/coupons', couponData);
    return response.data;
  },

  updateCoupon: async (couponId, couponData) => {
    const response = await api.put(`/promotion/coupons/${couponId}`, couponData);
    return response.data;
  },

  deleteCoupon: async (couponId) => {
    const response = await api.delete(`/promotion/coupons/${couponId}`);
    return response.data;
  },
};

// Assurance API endpoints
export const assuranceAPI = {
  // Insurance Policies
  createPolicy: async (policyData) => {
    const response = await api.post('/assurance/assurances', policyData);
    return response.data;
  },

  getAllPolicies: async () => {
    const response = await api.get('/assurance/assurances');
    return response.data;
  },

  getMyPolicies: async () => {
    const response = await api.get('/assurance/assurances/user/me');
    return response.data;
  },

  getPolicyById: async (id) => {
    const response = await api.get(`/assurance/assurances/${id}`);
    return response.data;
  },

  getPolicyByVehicle: async (vehicleId) => {
    const response = await api.get(`/assurance/assurances/vehicle/${vehicleId}`);
    return response.data;
  },

  getExpiringPolicies: async (days) => {
    const response = await api.get(`/assurance/assurances/expiring/${days}`);
    return response.data;
  },

  updatePolicy: async (id, updateData) => {
    const response = await api.put(`/assurance/assurances/${id}`, updateData);
    return response.data;
  },

  approvePolicy: async (id) => {
    const response = await api.put(`/assurance/assurances/${id}/approve`);
    return response.data;
  },

  cancelPolicy: async (id) => {
    const response = await api.put(`/assurance/assurances/${id}/cancel`);
    return response.data;
  },

  deletePolicy: async (id) => {
    const response = await api.delete(`/assurance/assurances/${id}`);
    return response.data;
  },

  // Claims (Constats)
  createClaim: async (claimData) => {
    const response = await api.post('/assurance/constats', claimData);
    return response.data;
  },

  getAllClaims: async () => {
    const response = await api.get('/assurance/constats');
    return response.data;
  },

  getMyClaims: async () => {
    const response = await api.get('/assurance/constats/user/me');
    return response.data;
  },

  getClaimById: async (id) => {
    const response = await api.get(`/assurance/constats/${id}`);
    return response.data;
  },

  getClaimsStatistics: async () => {
    const response = await api.get('/assurance/constats/stats');
    return response.data;
  },

  updateClaim: async (id, updateData) => {
    const response = await api.put(`/assurance/constats/${id}`, updateData);
    return response.data;
  },

  submitClaim: async (id) => {
    const response = await api.put(`/assurance/constats/${id}/submit`);
    return response.data;
  },

  reviewClaim: async (id, action, notes) => {
    const response = await api.put(`/assurance/constats/${id}/review`, { action, notes });
    return response.data;
  },

  addFraudDetection: async (id, fraudData) => {
    const response = await api.put(`/assurance/constats/${id}/fraud-detection`, fraudData);
    return response.data;
  },

  processPayment: async (id, paymentData) => {
    const response = await api.put(`/assurance/constats/${id}/payment`, paymentData);
    return response.data;
  },

  deleteClaim: async (id) => {
    const response = await api.delete(`/assurance/constats/${id}`);
    return response.data;
  },
};

// Maintenance API endpoints
export const maintenanceAPI = {
  // Maintenance Records
  getAllMaintenance: async () => {
    const response = await api.get('/maintenance');
    return response.data;
  },

  getMaintenanceById: async (id) => {
    const response = await api.get(`/maintenance/showById/${id}`);
    return response.data;
  },

  createMaintenance: async (maintenanceData) => {
    const response = await api.post('/maintenance', maintenanceData);
    return response.data;
  },

  updateMaintenance: async (id, updateData) => {
    const response = await api.put(`/maintenance/update/${id}`, updateData);
    return response.data;
  },

  deleteMaintenance: async (id) => {
    const response = await api.delete(`/maintenance/delete/${id}`);
    return response.data;
  },

  getMaintenanceByVehicle: async (vehicleId) => {
    const response = await api.get(`/maintenance/vehicule/${vehicleId}`);
    return response.data;
  },

  getMaintenanceByType: async (type) => {
    const response = await api.get(`/maintenance/type/${type}`);
    return response.data;
  },

  getMaintenanceHistory: async (vehicleId) => {
    const response = await api.get(`/maintenance/historique/${vehicleId}`);
    return response.data;
  },

  getMaintenanceCosts: async (id) => {
    const response = await api.get(`/maintenance/couts/${id}`);
    return response.data;
  },

  // Material/Parts Management
  getAllMaterials: async () => {
    const response = await api.get('/maintenance/materiel');
    return response.data;
  },

  getMaterialById: async (id) => {
    const response = await api.get(`/maintenance/materiel/showById/${id}`);
    return response.data;
  },

  getMaterialByName: async (name) => {
    const response = await api.get(`/maintenance/materiel/showByName/${name}`);
    return response.data;
  },

  createMaterial: async (materialData) => {
    const response = await api.post('/maintenance/materiel', materialData);
    return response.data;
  },

  updateMaterial: async (id, updateData) => {
    const response = await api.put(`/maintenance/materiel/update/${id}`, updateData);
    return response.data;
  },

  deleteMaterial: async (id) => {
    const response = await api.delete(`/maintenance/materiel/delete/${id}`);
    return response.data;
  },

  getMaterialsByCategory: async (category) => {
    const response = await api.get(`/maintenance/materiel/categorie/${category}`);
    return response.data;
  },

  getLowStockAlerts: async () => {
    const response = await api.get('/maintenance/materiel/alertes');
    return response.data;
  },

  restockMaterial: async (id, quantity) => {
    const response = await api.put(`/maintenance/materiel/reapprovisionner/${id}`, { quantity });
    return response.data;
  },

  getMaterialStatistics: async () => {
    const response = await api.get('/maintenance/materiel/statistiques');
    return response.data;
  },

  // Vehicle Management
  getAllVehicles: async () => {
    const response = await api.get('/maintenance/vehicule');
    return response.data;
  },

  getVehicleById: async (id) => {
    const response = await api.get(`/maintenance/vehicule/showById/${id}`);
    return response.data;
  },

  getVehicleByRegistration: async (registration) => {
    const response = await api.get(`/maintenance/vehicule/immatriculation/${registration}`);
    return response.data;
  },

  createVehicle: async (vehicleData) => {
    const response = await api.post('/maintenance/vehicule', vehicleData);
    return response.data;
  },

  updateVehicle: async (id, updateData) => {
    const response = await api.put(`/maintenance/vehicule/update/${id}`, updateData);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await api.delete(`/maintenance/vehicule/delete/${id}`);
    return response.data;
  },
};


// KYC API endpoints
export const kycAPI = {
  getKycStatus: async () => {
    const response = await api.get("/kyc/status");
    return response.data;
  },

  uploadDocument: async (documentType, file) => {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", documentType);

    const response = await api.post("/kyc/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get("/kyc/documents");
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await api.delete(`/kyc/documents/${documentId}`);
    return response.data;
  },

  submitKyc: async () => {
    const response = await api.post("/kyc/submit");
    return response.data;
  },

  // Admin KYC Management
  getAllKycRequests: async (params = {}) => {
    const response = await api.get("/admin/kyc", { params });
    return response.data;
  },

  getKycRequestById: async (kycId) => {
    const response = await api.get(`/admin/kyc/${kycId}`);
    return response.data;
  },

  approveKyc: async (kycId, notes) => {
    const response = await api.post(`/admin/kyc/${kycId}/approve`, { notes });
    return response.data;
  },

  rejectKyc: async (kycId, reason) => {
    const response = await api.post(`/admin/kyc/${kycId}/reject`, { reason });
    return response.data;
  },

  getKycStatistics: async () => {
    const response = await api.get("/admin/kyc/statistics");
    return response.data;
  },
};

export default api;
