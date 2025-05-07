import api from '@/services/api';

export interface SystemStatus {
  database: {
    status: 'operational' | 'warning' | 'error';
    label: string;
    message: string;
    response_time: string;
  };
  websocket: {
    status: 'operational' | 'warning' | 'error';
    label: string;
    message: string;
    response_time: string;
  };
  server: {
    status: 'operational' | 'warning' | 'error';
    label: string;
    message: string;
    php_version: string;
    memory_usage: string;
  };
  timestamp: string;
}

export interface SystemSettings {
  transfer_limit_enabled: boolean;
  transfer_limit_amount: number;
  transactions_blocked: boolean;
  block_message: string;
  last_updated: string;
  updated_by: number | null;
  updated_at?: string;
}

export interface PublicSystemStatus {
  transactions_enabled: boolean;
  message: string | null;
  transfer_limit: number | null;
}

export class SystemService {
  /**
   * Get system status information (admin only)
   */
  static async getSystemStatus(): Promise<SystemStatus> {
    try {
      console.log('Fetching system status from /api/admin/system/status');
      const response = await api.get('/api/admin/system/status');
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Invalid system status response format');
    } catch (error) {
      console.error('Error fetching system status:', error);
      
      // Return default offline status
      return {
        database: {
          status: 'error',
          label: 'Outage',
          message: 'Database connection failed',
          response_time: 'N/A'
        },
        websocket: {
          status: 'error',
          label: 'Outage',
          message: 'WebSocket connection failed',
          response_time: 'N/A'
        },
        server: {
          status: 'error',
          label: 'Degraded',
          message: 'Server is experiencing issues',
          php_version: 'Unknown',
          memory_usage: 'Unknown'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get system settings (admin only)
   */
  static async getSystemSettings(): Promise<SystemSettings> {
    try {
      const response = await api.get('/api/admin/system/settings');
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Invalid system settings response format');
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  }

  /**
   * Update system settings (admin only)
   */
  static async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response = await api.put('/api/admin/system/settings', settings);
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Invalid update settings response format');
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  /**
   * Get public system status (accessible to all users)
   */
  static async getPublicSystemStatus(): Promise<PublicSystemStatus> {
    try {
      const response = await api.get('/api/system/status');
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Invalid public system status response format');
    } catch (error) {
      console.error('Error fetching public system status:', error);
      
      // Return default status with transactions enabled
      return {
        transactions_enabled: true,
        message: null,
        transfer_limit: null
      };
    }
  }
} 