import api from './api';

export interface UserData {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  created_at?: string;
  default_account?: number | null;
}

export const UserService = {
  getUserById: async (id: number) => {
    try {
      const response = await api.get(`/api/users/${id}`);
      // Map result to match UserData interface
      const d = response.data;
      if (!d) return null;
      return {
        user_id: d.user_id,
        first_name: d.first_name,
        last_name: d.last_name,
        email: d.email,
        phone_number: d.phone_number,
        created_at: d.created_at,
        default_account: d.default_account ?? null,
      };
    } catch (error) {
      throw error;
    }
  },

  getUserByPhone: async (phoneNumber: string) => {
    try {
      const response = await api.get(`/api/users/number/${phoneNumber}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserByEmail: async (email: string) => {
    try {
      const response = await api.get(`/api/users/email/${email}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (id: number, data: any) => {
    try {
      const response = await api.put(`/api/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDefaultAccount: async (userId: number) => {
    try {
      const response = await api.get(`/api/users/${userId}/default-account`);
      // Returns the IPA id
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  setDefaultAccount: async (userId: number, accountId: number) => {
    try {
      const response = await api.put(`/api/users/${userId}/default-account`, { accountId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await api.get('/api/users');
      console.log('User API response:', response);
      
      // Check for different response formats
      if (response.data && response.data.status === 'success' && response.data.data) {
        // Standard API response format with status and data fields
        return response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        // Direct array response
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Object response that might contain users
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          // Return the first array found (likely the users array)
          return possibleArrays[0];
        }
        // If no arrays found but has keys, might be a single object
        return Object.values(response.data);
      } else {
        console.error('Unexpected response format from users API:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  setUserRole: async (userId: number, role: string) => {
    const response = await api.put(`/api/users/${userId}`, { role });
    return response.data.data;
  },
  
  getUserRole: async (userId: number): Promise<string | null> => {
    try {
      const response = await api.get(`/api/users/${userId}/role`);
      return response.data.role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  }
};
