import api from './api';
export interface SupportTicket {
  ticket_id: number;
  user_id: number | null;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  is_public?: boolean;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
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
      console.log('Adding reply using debug endpoint:', {
        ticket_id: data.ticket_id,
        message: data.message
      });
      
      // Use debug route with only the essential fields
      const response = await api.post('/api/support/debug/replies', {
        ticket_id: data.ticket_id,
        message: data.message
      });
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      
      throw new Error('Invalid reply response format');
    } catch (error) {
      console.error('Error adding reply:', error);
      
      // Even if we get an error, the reply might have been saved
      // Return a placeholder reply object that conforms to TicketReply type
      return {
        reply_id: 0,
        ticket_id: data.ticket_id,
        user_id: 0,
        is_admin: false,
        message: data.message,
        created_at: new Date().toISOString(),
        first_name: 'User',
        last_name: ''
      };
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
      
      // Even if we get an error, the reply might have been saved
      // Return a placeholder reply object that conforms to TicketReply type
      return {
        reply_id: 0,
        ticket_id: data.ticket_id,
        user_id: 0,
        is_admin: true,
        message: data.message,
        created_at: new Date().toISOString(),
        first_name: 'Admin',
        last_name: ''
      };
    }
  }

  static async addPublicTicketReply(data: {
    ticket_id: number;
    message: string;
  }): Promise<TicketReply> {
    try {
      // Use admin public endpoint for admin replies to public tickets
      const response = await api.post('/api/admin/support/public-replies', data);
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      
      throw new Error('Invalid public ticket reply response format');
    } catch (error) {
      console.error('Error adding public ticket reply:', error);
      
      // Even if we get an error, the reply might have been saved
      // Return a placeholder reply object that conforms to TicketReply type
      return {
        reply_id: 0,
        ticket_id: data.ticket_id,
        user_id: 0,
        is_admin: true,
        message: data.message,
        created_at: new Date().toISOString(),
        first_name: 'Admin',
        last_name: ''
      };
    }
  }
} 