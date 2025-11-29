import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Complaints API
export const complaintsAPI = {
  getComplaints: (params) => api.get('/complaints', { params }),
  getComplaint: (id) => api.get(`/complaints/${id}`),
  submitComplaint: (formData) => api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateComplaint: (id, data) => api.put(`/complaints/${id}`, data),
};

// Admin API
export const adminAPI = {
  getAllComplaints: (params) => api.get('/admin/complaints', { params }),
  updateComplaintStatus: (id, data) => api.put(`/admin/complaints/${id}/status`, data),
  addAdminNote: (id, note) => api.post(`/admin/complaints/${id}/notes`, { note }),
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
};

export default api;