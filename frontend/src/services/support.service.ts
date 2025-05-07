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
      // Simple direct API call with whatever data was provided
      const response = await api.post('/api/support/replies', data);
      
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
      // Get the admin user ID from localStorage
      const userJson = localStorage.getItem('user');
      let adminUserId = 0;
      
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          adminUserId = user.user_id;
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
      
      if (!adminUserId) {
        throw new Error('Admin user ID not found');
      }
      
      // Add admin_user_id to the request
      const requestData = {
        ...data,
        admin_user_id: adminUserId
      };
      
      // Use admin endpoint for admin replies
      const response = await api.post('/api/admin/support/replies', requestData);
      
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

  static async addPublicTicketReply(data: {
    ticket_id: number;
    message: string;
  }): Promise<TicketReply> {
    try {
      // Get the admin user ID from localStorage
      const userJson = localStorage.getItem('user');
      let adminUserId = 0;
      
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          adminUserId = user.user_id;
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
      
      if (!adminUserId) {
        throw new Error('Admin user ID not found');
      }
      
      // Add admin_user_id to the request
      const requestData = {
        ...data,
        admin_user_id: adminUserId
      };
      
      // Use admin public endpoint for admin replies to public tickets
      const response = await api.post('/api/admin/support/public-replies', requestData);
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      
      throw new Error('Invalid public ticket reply response format');
    } catch (error) {
      console.error('Error adding public ticket reply:', error);
      throw error;
    }
  }
} 