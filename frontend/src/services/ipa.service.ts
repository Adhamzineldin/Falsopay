
import api from './api';

// Use schema fields
export interface IpaData {
  bank_id: number;
  account_number: string;
  ipa_address: string;
  user_id: number;
  pin: string;
}

export interface VerifyPinData {
  ipa_address: string;
  pin: string;
}

export interface UpdatePinData {
  ipa_address: string;
  new_pin: string;
}

export const IPAService = {
  createIPA: async (ipaData: IpaData) => {
    try {
      const response = await api.post('/api/ipa', ipaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getIPAsByUserId: async (userId: number) => {
    try {
      const response = await api.get(`/api/ipa/by-user/${userId}`);
      
      if (!Array.isArray(response.data)) {
        console.error('Expected array for IPAs, got:', response.data);
        return [];
      }
      
      return response.data.map((ipa: any) => ({
        ipa_id: ipa.ipa_id,
        bank_id: ipa.bank_id,
        account_number: ipa.account_number,
        ipa_address: ipa.ipa_address,
        user_id: ipa.user_id,
        pin: ipa.pin,
        created_at: ipa.created_at,
        bank_name: ipa.bank_name,
      }));
    } catch (error) {
      console.error('Error fetching IPAs by user ID:', error);
      throw error;
    }
  },

  getIPAByAddress: async (ipaAddress: string) => {
    try {
      const response = await api.get(`/api/ipa/by-ipa/${ipaAddress}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePin: async (data: UpdatePinData) => {
    try {
      const response = await api.put('/api/ipa/update-pin', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyPin: async (data: VerifyPinData) => {
    try {
      const response = await api.post('/api/ipa/verify-pin', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAllByUserId: async (userId: number) => {
    try {
      const response = await api.delete(`/api/ipa/by-user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
