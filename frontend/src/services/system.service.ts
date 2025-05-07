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

export class SystemService {
  /**
   * Get system status information (admin only)
   */
  static async getSystemStatus(): Promise<SystemStatus> {
    try {
      console.log('Fetching system status from /api/admin/system/status');
      const response = await api.get('/api/admin/system/status', {
        timeout: 5000 // 5 second timeout
      });
      
      console.log('Response data:', response.data);
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data as SystemStatus;
      }
      
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Error fetching system status:', error);
      console.error('Error details:', error.response?.status, error.response?.data, error.message);
      
      // Return a default error status
      return {
        database: {
          status: 'error',
          label: 'Unavailable',
          message: `Error: ${error.response?.status || error.message || 'Backend unreachable'}`,
          response_time: 'N/A'
        },
        websocket: {
          status: 'error',
          label: 'Unavailable',
          message: `Error: ${error.response?.status || error.message || 'Backend unreachable'}`,
          response_time: 'N/A'
        },
        server: {
          status: 'error',
          label: 'Unavailable',
          message: `Error: ${error.response?.status || error.message || 'Backend unreachable'}`,
          php_version: 'Unknown',
          memory_usage: 'Unknown'
        },
        timestamp: new Date().toISOString()
      };
    }
  }
} 