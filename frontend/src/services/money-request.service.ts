import ApiService from '@/services/api';
import WhatsAppHelper from '@/utils/whatsapp-helper';

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
      let responseData = response.data;
      
      // Ensure we're working with a proper object
      if (typeof responseData === 'string') {
        try {
          responseData = JSON.parse(responseData);
        } catch (e) {
          // If we can't parse, keep the original
        }
      }
      
      // Check if we received the WhatsApp notification response format
      if (WhatsAppHelper.isWhatsAppNotification(responseData)) {
        // Extract transaction_id from the data
        const transactionId = WhatsAppHelper.extractTransactionId(responseData);
        const notificationMessage = WhatsAppHelper.getWhatsAppNotificationMessage(responseData);
        
        return {
          success: true,
          transaction_id: transactionId,
          whatsapp_notification: true,
          message: notificationMessage,
          data: responseData
        };
      }
      
      // Check for direct transaction_id in response (simple format)
      if (responseData && responseData.transaction_id && typeof responseData.transaction_id === 'number') {
        return {
          success: true,
          transaction_id: responseData.transaction_id,
          message: 'Transaction completed successfully',
          data: responseData
        };
      }
      
      // Return the original response if not in WhatsApp format
      return responseData;
    } catch (error) {
      console.error('Error accepting request:', error);
      
      // If the transaction went through but we got a network error, return partial success
      const errorResponse = error.response?.data;
      if (errorResponse && errorResponse.transaction_id) {
        return {
          success: true,
          transaction_id: errorResponse.transaction_id,
          message: 'Payment completed but notification may have failed',
          partial_success: true,
          error: error
        };
      }
      
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