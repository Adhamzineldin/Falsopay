import ApiService from '@/services/api';

interface AcceptRequestOptions {
  pin: string;
  sender_ipa_address: string;
}

class MoneyRequestService {
  /**
   * Create a new money request
   * 
   * @param amount - The amount to request
   * @param ipaAddress - The IPA address to request from
   * @param message - Optional message for the request
   */
  async createRequest(amount: number, ipaAddress: string, message?: string) {
    try {
      const response = await ApiService.post('/api/money-requests', {
        amount,
        requested_ipa_address: ipaAddress,
        message
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all pending money requests for the current user
   */
  async getPendingRequests() {
    try {
      const response = await ApiService.get('/api/money-requests/pending');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all money requests (both sent and received) for the current user
   */
  async getAllRequests() {
    try {
      const response = await ApiService.get('/api/money-requests');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific money request by ID
   * 
   * @param requestId - The ID of the request to get
   */
  async getRequestById(requestId: number) {
    try {
      const response = await ApiService.get(`/api/money-requests/${requestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Accept a money request
   * 
   * @param requestId - The ID of the request to accept
   * @param options - Optional settings including PIN and sender IPA address
   */
  async acceptRequest(requestId: number, options?: AcceptRequestOptions) {
    try {
      const payload = {
        action: 'accept',
        pin: options?.pin,
        sender_ipa_address: options?.sender_ipa_address
      };
      
      const response = await ApiService.post(`/api/money-requests/${requestId}/process`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Decline a money request
   * 
   * @param requestId - The ID of the request to decline
   */
  async declineRequest(requestId: number) {
    try {
      const response = await ApiService.post(`/api/money-requests/${requestId}/process`, {
        action: 'decline'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new MoneyRequestService(); 