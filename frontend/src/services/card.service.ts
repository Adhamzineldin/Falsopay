
import api from './api';

export interface CardData {
  card_id: number;
  bank_user_id: number;
  card_number: string;
  expiration_date: string;
  cvv: string;
  pin?: string;
  card_type: 'debit' | 'prepaid';
  bank_id: number;
  is_active: boolean;
}

export const CardService = {
  getCards: async () => {
    try {
      const response = await api.get('/api/cards');
      return Array.isArray(response.data) 
        ? response.data 
        : [];
    } catch (error) {
      console.error('Error fetching cards:', error);
      return [];
    }
  },
  
  getCardByNumber: async (cardNumber: string, bankId: number) => {
    try {
      const response = await api.get(`/api/cards/bank/${bankId}/card/${cardNumber}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getCardsByUserId: async (userId: number) => {
    try {
      const response = await api.get(`/api/cards/by-user/${userId}`);
      return Array.isArray(response.data) 
        ? response.data 
        : [];
    } catch (error) {
      console.error('Error fetching user cards:', error);
      return [];
    }
  },
  
  verifyCardPin: async (cardNumber: string, pin: string) => {
    try {
      const response = await api.post('/api/cards/verify-pin', {
        card_number: cardNumber,
        pin: pin
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
