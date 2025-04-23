
import api from './api';

// Updated to match backend schema
export interface BankAccount {
  bank_id: number;
  account_number: string;
  bank_user_id: number;
  iban: string;
  status: 'active' | 'inactive';
  type: string;
  balance: number;
  created_at?: string;
}

interface LinkAccountParams {
  card_number: string;
  phone_number: string;
  bank_id: number;
  card_pin: string;
}

export const BankAccountService = {
  createBankAccount: async (accountData: BankAccount) => {
    try {
      const response = await api.post('/api/bank-accounts', accountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getAccountsByUserId: async (bankUserId: number) => {
    try {
      // backend expects "bank_user_id"
      const response = await api.get(`/api/bank-accounts/user/${bankUserId}`);
      // Ensure keys match backend
      return Array.isArray(response.data)
        ? response.data.map((acc: any) => ({
            ...acc,
            bank_id: acc.bank_id,
            account_number: acc.account_number,
            bank_user_id: acc.bank_user_id,
            iban: acc.iban,
            status: acc.status,
            type: acc.type,
            balance: parseFloat(acc.balance),
            created_at: acc.created_at,
          }))
        : [];
    } catch (error) {
      throw error;
    }
  },
  getAccountsByUserIdAndBankId: async (bankUserId: number, bankId: number) => {
    try {
      // backend expects "bank_user_id"
      const response = await api.get(`/api/bank-accounts/user/${bankUserId}/bank/${bankId}`);
      // Ensure keys match backend
      return Array.isArray(response.data)
          ? response.data.map((acc: any) => ({
            ...acc,
            bank_id: acc.bank_id,
            account_number: acc.account_number,
            bank_user_id: acc.bank_user_id,
            iban: acc.iban,
            status: acc.status,
            type: acc.type,
            balance: parseFloat(acc.balance),
            created_at: acc.created_at,
          }))
          : [];
    } catch (error) {
      throw error;
    }
  },
  
  getAccountByIBAN: async (iban: string) => {
    try {
      const response = await api.get(`/api/bank-accounts/iban/${iban}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getAccountBalance: async (bankId: number, accountNumber: string) => {
    try {
      const response = await api.get(`/api/bank-accounts/${bankId}/${accountNumber}/balance`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  addBalance: async (bankId: number, accountNumber: string, amount: number) => {
    try {
      const response = await api.patch(`/api/bank-accounts/${bankId}/${accountNumber}/add-balance`, { amount });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  subtractBalance: async (bankId: number, accountNumber: string, amount: number) => {
    try {
      const response = await api.patch(`/api/bank-accounts/${bankId}/${accountNumber}/subtract-balance`, { amount });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  linkAccountToService: async (params: LinkAccountParams) => {
    try {
      const response = await api.post('/api/bank-accounts/link', params);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getAccountByNumberAndBankId: async (bankId: number, accountNumber: string)=> {
  try {
    const response = await api.get(`/api/bank-accounts/${bankId}/${accountNumber}`);
    return response.data;
  } catch (error) {
    throw error;
  }
  }
};
