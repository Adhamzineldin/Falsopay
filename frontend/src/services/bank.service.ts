
import api from './api';

export interface BankData {
  bank_id: number;
  bank_name: string;
  bank_code: string;
  swift_code: string;
}

export const BankService = {
  getAllBanks: async () => {
    try {
      const response = await api.get('/api/banks');
      return Array.isArray(response.data) 
        ? response.data.map((bank: any) => ({
            bank_id: bank.bank_id,
            bank_name: bank.bank_name,
            bank_code: bank.bank_code,
            swift_code: bank.swift_code
          }))
        : [];
    } catch (error) {
      console.error('Error fetching banks:', error);
      return [];
    }
  },
  
  getBankById: async (id: number) => {
    try {
      const response = await api.get(`/api/banks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  createBank: async (bankData: Omit<BankData, 'bank_id'>) => {
    try {
      const response = await api.post('/api/banks', bankData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateBank: async (id: number, bankData: Partial<BankData>) => {
    try {
      const response = await api.put(`/api/banks/${id}`, bankData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
