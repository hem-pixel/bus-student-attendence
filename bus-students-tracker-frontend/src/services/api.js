import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bus_tracker_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getBuses: () => api.get('/admin/buses')
};

export const inchargeAPI = {
  getAssignedBus: () => api.get('/incharge/assigned-bus'),
  markAttendance: (data) => api.post('/incharge/attendance', data)
};

export const studentAPI = {
  getStatus: () => api.get('/student/status')
};

export default api;
