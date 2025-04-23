
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
  }
};
