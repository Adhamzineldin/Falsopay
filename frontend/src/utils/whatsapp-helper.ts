/**
 * Helper functions for handling WhatsApp notification responses
 */

/**
 * Checks if the response is a WhatsApp notification
 * 
 * @param response - The response to check
 * @returns boolean indicating if the response is a WhatsApp notification
 */
export const isWhatsAppNotification = (response: any): boolean => {
  return (
    response && 
    response.messaging_product === 'whatsapp' && 
    Array.isArray(response.contacts) &&
    Array.isArray(response.messages)
  );
};

/**
 * Extracts transaction ID from combined WhatsApp notification and transaction response
 * 
 * @param response - The response containing WhatsApp notification and transaction data
 * @returns The transaction ID or null if not found
 */
export const extractTransactionId = (response: any): number | null => {
  if (!response) return null;
  
  // Look for transaction_id directly in the root of the object (most common case)
  if (typeof response.transaction_id === 'number') {
    return response.transaction_id;
  }
  
  // Check success object if it contains a transaction_id
  if (response.success && typeof response.success.transaction_id === 'number') {
    return response.success.transaction_id;
  }
  
  // Look for transaction_id in the 'data' field (sometimes nested there)
  if (response.data && typeof response.data.transaction_id === 'number') {
    return response.data.transaction_id;
  }
  
  // Special case for responses that have a trailing structure with transaction_id
  const lastLine = response.lastResponseLine || response.lastLine;
  if (lastLine && typeof lastLine === 'string') {
    try {
      const parsedLastLine = JSON.parse(lastLine);
      if (parsedLastLine && typeof parsedLastLine.transaction_id === 'number') {
        return parsedLastLine.transaction_id;
      }
    } catch (e) {
      // Failed to parse, ignore
    }
  }
  
  return null;
};

/**
 * Builds a user-friendly message for WhatsApp notification results
 * 
 * @param response - The WhatsApp notification response
 * @returns A user-friendly message
 */
export const getWhatsAppNotificationMessage = (response: any): string => {
  if (!isWhatsAppNotification(response)) {
    return 'Transaction completed, but no WhatsApp notification was sent.';
  }
  
  return 'Transaction completed and WhatsApp notification was sent successfully.';
};

export default {
  isWhatsAppNotification,
  extractTransactionId,
  getWhatsAppNotificationMessage
}; 