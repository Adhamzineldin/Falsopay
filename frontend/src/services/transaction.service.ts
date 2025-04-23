
import api from './api';

// Use backend schema for field names
export interface TransactionData {
  sender_user_id: number;
  receiver_user_id: number;
  sender_name?: string;
  receiver_name?: string;
  amount: number;
  sender_bank_id?: number;
  receiver_bank_id?: number;
  sender_account_number?: string;
  receiver_account_number?: string;
  status?: string;
  currency?: string;
  transaction_time?: string;
  sender_ipa_address?: string;
  receiver_ipa_address?: string;
  receiver_phone?: string;
  receiver_card?: string;
  receiver_iban?: string;
  transfer_method?: 'ipa' | 'mobile' | 'card' | 'account' | 'iban';
  pin?: string;
}

export interface SendMoneyData {
  sender_user_id: number;
  receiver_user_id ?: number;
  amount: number;
  transaction_type: 'send' | 'receive';
  sender_bank_id?: number;
  receiver_bank_id?: number;
  sender_account_number?: string;
  receiver_account_number?: string;
  sender_ipa_address?: string;
  receiver_ipa_address?: string;
  receiver_phone?: string;
  receiver_card?: string;
  receiver_iban?: string;
  transfer_method?: 'ipa' | 'mobile' | 'card' | 'account' | 'iban';
  pin?: string;
}

export const TransactionService = {
  createTransaction: async (transactionData: TransactionData) => {
    try {
      const response = await api.post('/api/transactions', transactionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllTransactions: async () => {
    try {
      const response = await api.get('/api/transactions');
      // Ensure returned transactions use backend schema for key names
      return Array.isArray(response.data)
        ? response.data.map((tx: any) => ({
            ...tx,
            transaction_id: tx.transaction_id,
            sender_user_id: tx.sender_user_id,
            receiver_user_id: tx.receiver_user_id,
            amount: parseFloat(tx.amount),
            transaction_type: tx.transaction_type,
            status: tx.status || 'completed',
            currency: tx.currency || 'EUR',
            transaction_time: tx.transaction_time,
            sender_bank_id: tx.sender_bank_id,
            receiver_bank_id: tx.receiver_bank_id,
            sender_account_number: tx.sender_account_number,
            receiver_account_number: tx.receiver_account_number,
            sender_ipa_address: tx.sender_ipa_address,
            receiver_ipa_address: tx.receiver_ipa_address,
            receiver_phone: tx.receiver_phone,
            receiver_card: tx.receiver_card,
            receiver_iban: tx.receiver_iban,
            transfer_method: tx.transfer_method,
          }))
        : [];
    } catch (error) {
      throw error;
    }
  },

  getTransactionsByUserId: async (userId: number) => {
    try {
      // Backend expects "user_id"
      const response = await api.get(`/api/transactions/by-user/${userId}`);
      return Array.isArray(response.data)
        ? response.data.map((tx: any) => ({
            ...tx,
            transaction_id: tx.transaction_id,
            sender_user_id: tx.sender_user_id,
            receiver_user_id: tx.receiver_user_id,
            amount: parseFloat(tx.amount),
            transaction_type: tx.transaction_type,
            status: tx.status || 'completed',
            currency: tx.currency || 'EUR',
            transaction_time: tx.transaction_time,
            sender_bank_id: tx.sender_bank_id,
            receiver_bank_id: tx.receiver_bank_id,
            sender_account_number: tx.sender_account_number,
            receiver_account_number: tx.receiver_account_number,
            sender_name: tx.sender_name,
            receiver_name: tx.receiver_name,
            sender_ipa_address: tx.sender_ipa_address,
            receiver_ipa_address: tx.receiver_ipa_address,
            receiver_phone: tx.receiver_phone,
            receiver_card: tx.receiver_card,
            receiver_iban: tx.receiver_iban,
            transfer_method: tx.transfer_method,
          }))
        : [];
    } catch (error) {
      throw error;
    }
  },

  sendMoney: async (sendData: SendMoneyData) => {
    try {
      const response = await api.post('/api/transactions/send-money', sendData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // New method to get cards
  getCards: async () => {
    try {
      const response = await api.get('/api/cards');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
