import api from './api';
import { DateTime } from 'luxon';
interface LoginCredentials {
  phone_number: string;
  ipa_address: string;
}

interface PhoneCheckParams {
  phone_number: string;
}

interface UserRegistrationData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  default_account?: string;
}

interface AuthResponse {
  user_token: string;
  user: any;
}

interface UserInfoResponse {
  success: boolean;
  message: string;
  user: {
    phone_number: string;
    name?: string;
    email?: string;
    isDefault: boolean;
    // Add other user properties as needed
  };
}



export const AuthService = {
  // Request a verification code to be sent to the user's phone
  requestLoginCode: async (phone_number: string): Promise<{ success: boolean, message: string, code?: string }> => {
    try {
      // Generate a random 4-digit code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Create a clear message with the verification code
      const message = `Your FalsoPay verification code is: ${code}. Please enter this code to complete your login.`;
      
      // Send the code to the backend as required
      const response = await api.post('/api/send-msg', { 
        recipient: phone_number, 
        message: message
      });
      
      // Check if response contains expected WhatsApp API response fields
      if (response.data && response.data.messaging_product === "whatsapp" && 
          response.data.messages && response.data.messages.length > 0) {
        return { 
          success: true, 
          message: "Verification code sent successfully", 
          code 
        };
      } else {
        // Handle case where API responded but without expected structure
        return { 
          success: true, 
          message: "Verification code sent", 
          code 
        };
      }
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send verification code",
        code: undefined
      };
    }
  },
  
  sendCode: async (phone_number: string, code: string): Promise<{ success: boolean; message: string; code: string }> => {
    const message = `Your FalsoPay verification code is: ${code}. Please enter this code to complete your login.`;
    
    const response = await api.post('/api/send-msg', {
      recipient: phone_number,
      message: message
    });

    // Check if response contains expected WhatsApp API response fields
    if (response.data && response.data.messaging_product === "whatsapp" &&
        response.data.messages && response.data.messages.length > 0) {
      return {
        success: true,
        message: "Verification code sent successfully",
        code
      };
    } else {
      // Handle case where API responded but without expected structure
      return {
        success: true,
        message: "Verification code sent",
        code
      };
  }},
  
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('Logging in with credentials:', credentials);
      
      // Make sure phone number and ipa_address are properly formatted
      const formattedCredentials = {
        phone_number: credentials.phone_number.trim(),
        ipa_address: credentials.ipa_address.trim()
      };
      
      // Make the API call but don't change state or navigation on errors
      const response = await api.post('/api/login', formattedCredentials);
      console.log('Login response:', response.data);
      
      // Only return valid data with proper structure
      if (!response.data || !response.data.user_token || !response.data.user) {
        throw new Error('Invalid response data format');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Auth service login error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      // Re-throw to let the calling function handle it
      throw error;
    }
  },

  saveAuthToken: (token: string) => {
    // Calculate expiry time (1 hour from Cairo time)
    const expiryTime = DateTime.now().setZone('Africa/Cairo').plus({ hours: 1 }).toMillis();

    const cairoTime = DateTime.now().setZone('Africa/Cairo');
    console.log("Current Cairo time:", cairoTime.toString()); // Check if this matches your expectation
    console.log("Current Cairo timestamp:", cairoTime.toMillis());
    
    // Store token and expiry time in localStorage
    localStorage.setItem('falsopay_token', token);
    localStorage.setItem('falsopay_token_expiry', expiryTime);

    console.log('Token saved with Cairo-based expiry');
  },
  
  logout: () => {
    localStorage.removeItem('falsopay_token');
    localStorage.removeItem('falsopay_token_expiry');
    localStorage.removeItem('falsopay_user');
    console.log('User logged out, storage cleared');
  },
  
  checkIfUserExists: async (params: PhoneCheckParams): Promise<boolean> => {
    try {
      const response = await api.post('/api/check-phone', params);
      return response.data.exists;
    } catch (error) {
      throw error;
    }
  },
  
  registerUser: async (userData: UserRegistrationData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/create-user', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteAccount: async (userId: number): Promise<any> => {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add this method to your AuthService object
  getUserInfo: async (phone_number: string): Promise<UserInfoResponse> => {
    try {
      const response = await api.get(`/api/users/number/${phone_number}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  },
  
  //email verfication
  sendVerificationCode: async (mail: string, code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post('/api/send-verification-email', { mail, code });
      return response.data;
    } catch (error) {
      console.error("Error sending verification code:", error);
      throw error;
    }
  },
    
  
  

  // Helper method to check if token is valid
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('falsopay_token');
    const expiry = localStorage.getItem('falsopay_token_expiry');


    const cairoTime = DateTime.now().setZone('Africa/Cairo');
    console.log("Current Cairo time:", cairoTime.toString()); // Check if this matches your expectation
    console.log("Current Cairo timestamp:", cairoTime.toMillis());

    if (!token || !expiry) {
      console.log('No token or expiry found');
      return false;
    }

    // Get the current time in Cairo timezone
    const now = DateTime.now().setZone('Africa/Cairo').toMillis();
    const expiryTime = parseInt(expiry, 10);

    // If token has expired, clean up
    if (now > expiryTime) {
      console.log('Token expired, cleaning up');
      localStorage.removeItem('falsopay_token');
      localStorage.removeItem('falsopay_token_expiry');
      localStorage.removeItem('falsopay_user');
      return false;
    }

    return true;
  }
};
