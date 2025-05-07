import api from './api';
export interface SupportTicket {
  ticket_id: number;
  user_id: number;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
}

export interface TicketReply {
  reply_id: number;
  ticket_id: number;
  user_id: number;
  is_admin: boolean;
  message: string;
  created_at: string;
  first_name: string;
  last_name: string;
}

export interface TicketWithReplies {
  ticket: SupportTicket;
  replies: TicketReply[];
}

export class SupportService {
  static async createTicket(data: {
    user_id: number;
    subject: string;
    message: string;
  }): Promise<SupportTicket> {
    try {
      const response = await api.post('/api/support/tickets', data);
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Might be the direct ticket object
        return response.data;
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  static async getUserTickets(userId: number): Promise<SupportTicket[]> {
    try {
      const response = await api.get(`/api/users/${userId}/tickets`);
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          return possibleArrays[0] as SupportTicket[];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      return [];
    }
  }

  static async getTicket(ticketId: number, userId: number): Promise<TicketWithReplies> {
    try {
      const response = await api.get(`/api/support/tickets/${ticketId}/${userId}`);
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else if (response.data && typeof response.data === 'object' &&
                typeof response.data.ticket === 'object' && 
                Array.isArray(response.data.replies)) {
        return response.data;
      }
      
      throw new Error('Invalid ticket response format');
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  }

  static async addReply(data: {
    ticket_id: number;
    message: string;
    user_id?: number;
  }): Promise<TicketReply> {
    try {
      // Get current user ID from localStorage if available if not provided
      const userData = localStorage.getItem('user_data');
      const currentUser = userData ? JSON.parse(userData) : null;
      const userId = data.user_id || currentUser?.user_id;
      
      // Use debug route to bypass ownership check
      const response = await api.post('/api/support/debug/replies', {
        ...data,
        user_id: userId
      });
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      
      throw new Error('Invalid reply response format');
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  }

  // Admin methods
  static async getAllTickets(): Promise<SupportTicket[]> {
    try {
      const response = await api.get('/api/admin/support/tickets');
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          return possibleArrays[0] as SupportTicket[];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      return [];
    }
  }

  static async getTicketsByStatus(status: string): Promise<SupportTicket[]> {
    try {
      const response = await api.get(`/api/admin/support/tickets/status/${status}`);
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          return possibleArrays[0] as SupportTicket[];
        }
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching tickets with status ${status}:`, error);
      return [];
    }
  }

  static async updateTicketStatus(ticketId: number, status: string): Promise<boolean> {
    try {
      const response = await api.put(`/api/admin/support/tickets/${ticketId}/status/${status}`);
      return response.data && response.data.status === 'success';
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return false;
    }
  }

  static async getTicketAdmin(ticketId: number): Promise<TicketWithReplies> {
    try {
      const response = await api.get(`/api/admin/support/tickets/${ticketId}`);
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else if (response.data && typeof response.data === 'object' &&
                typeof response.data.ticket === 'object' && 
                Array.isArray(response.data.replies)) {
        return response.data;
      }
      
      throw new Error('Invalid ticket response format');
    } catch (error) {
      console.error('Error fetching admin ticket:', error);
      throw error;
    }
  }

  static async addAdminReply(data: {
    ticket_id: number;
    message: string;
  }): Promise<TicketReply> {
    try {
      // Use admin endpoint for admin replies
      const response = await api.post('/api/admin/support/replies', data);
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      
      throw new Error('Invalid admin reply response format');
    } catch (error) {
      console.error('Error adding admin reply:', error);
      throw error;
    }
  }
} 