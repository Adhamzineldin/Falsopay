import axios from 'axios';
import { toast } from '@/components/ui/sonner';
import {DateTime} from "luxon";
import WhatsAppHelper from '@/utils/whatsapp-helper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
    (response) => {
        // Handle WhatsApp notification response format
        if (WhatsAppHelper.isWhatsAppNotification(response.data)) {
            // Check for transaction_id in the response data object
            const transactionId = WhatsAppHelper.extractTransactionId(response.data);
            
            // If there's a transaction_id property in the response, it's a combined response
            if (transactionId) {
                // Format the response as a success with the transaction ID
                return {
                    ...response,
                    data: {
                        success: true,
                        transaction_id: transactionId,
                        whatsapp_notification: true,
                        message: WhatsAppHelper.getWhatsAppNotificationMessage(response.data),
                        data: response.data
                    }
                };
            }
        } else if (response.data && typeof response.data === 'object') {
            // Check if this is a raw transaction response with transaction_id
            if (response.data.transaction_id && !response.data.success) {
                // Format it as a success response
                return {
                    ...response,
                    data: {
                        success: true, 
                        transaction_id: response.data.transaction_id,
                        data: response.data
                    }
                };
            }
        }
        
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Get token expiry time from localStorage
        const expiry = localStorage.getItem('falsopay_token_expiry');

        if (!expiry) {
            return Promise.reject(error);
        }

        // Get current time in Cairo time zone
        const now = DateTime.now().setZone('Africa/Cairo').toMillis();
        const expiryTime = parseInt(expiry, 10);

        const isExpired = expiryTime <= now;

        if (
            error.response &&
            error.response.status === 401 &&
            isExpired &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            // Clear token and redirect to login
            localStorage.removeItem('falsopay_token');
            localStorage.removeItem('falsopay_token_expiry');
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;

