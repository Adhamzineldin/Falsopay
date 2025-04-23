
import axios from 'axios';
import { toast } from '@/components/ui/sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('falsopay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If token has expired (401) and hasn't been retried yet
    // if (error.response && error.response.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;
    //  
    //   // Clear token and redirect to login
    //   localStorage.removeItem('falsopay_token');
    //   window.location.href = '/login';
    //  
    //   // Show toast notification
    //   toast.error('Session expired. Please login again.');
    // }
    
    return Promise.reject(error);
  }
);

export default api;

