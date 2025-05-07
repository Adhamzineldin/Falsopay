import api from './api';
import { SystemService } from './system.service';

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
  receiver_mobile_number?: string;
  receiver_card_number?: string;
  receiver_iban?: string;
  transfer_method?: 'ipa' | 'mobile' | 'card' | 'account' | 'iban';
  pin?: string;
}

export const TransactionService = {
  // Check if transactions are allowed and respect the transfer limit
  checkTransactionStatus: async (amount: number) => {
    try {
      // Get public system status
      const systemStatus = await SystemService.getPublicSystemStatus();
      
      // If transactions are not enabled, return error with message
      if (!systemStatus.transactions_enabled) {
        return {
          allowed: false,
          message: systemStatus.message || 'Transactions are currently disabled by the administrator',
          errorCode: 'TRANSACTIONS_BLOCKED'
        };
      }
      
      // If there's a transfer limit, check if the amount exceeds it
      if (systemStatus.transfer_limit && amount > systemStatus.transfer_limit) {
        return {
          allowed: false,
          message: `Transaction amount exceeds the current transfer limit of ${systemStatus.transfer_limit}`,
          errorCode: 'TRANSFER_LIMIT_EXCEEDED',
          limit: systemStatus.transfer_limit
        };
      }
      
      // All checks passed
      return {
        allowed: true
      };
    } catch (error) {
      console.error('Error checking transaction status:', error);
      // Default to allowing transactions if we can't check status
      return { allowed: true };
    }
  },

  createTransaction: async (transactionData: TransactionData) => {
    try {
      // Check transaction status before sending
      const statusCheck = await TransactionService.checkTransactionStatus(transactionData.amount);
      if (!statusCheck.allowed) {
        throw new Error(statusCheck.message);
      }
      
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
            currency: tx.currency || 'EGP',
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
            currency: tx.currency || 'EGP',
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
      // Check transaction status before sending
      const statusCheck = await TransactionService.checkTransactionStatus(sendData.amount);
      if (!statusCheck.allowed) {
        throw new Error(statusCheck.message);
      }
      
      // Use the correct API endpoint for sending money
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
