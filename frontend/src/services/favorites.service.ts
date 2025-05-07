import api from './api';

export interface Favorite {
  favorite_id: number;
  user_id: number;
  recipient_identifier: string;
  recipient_name: string;
  method: 'ipa' | 'mobile' | 'card' | 'account' | 'iban';
  bank_id: number | null;
  bank_name?: string;
  created_at: string;
}

export class FavoritesService {
  static async createFavorite(data: {
    user_id: number;
    recipient_identifier: string;
    recipient_name: string;
    method: 'ipa' | 'mobile' | 'card' | 'account' | 'iban';
    bank_id?: number;
  }): Promise<Favorite> {
    const response = await api.post('/api/favorites', data);
    
    // Handle different response formats
    if (response.data && response.data.status === 'success' && response.data.data) {
      return response.data.data;
    } else if (response.data && typeof response.data === 'object') {
      // Might be the direct favorite object
      return response.data;
    } 
    
    // Return empty object if no data found
    console.error('Unexpected response format from favorites API:', response.data);
    return {} as Favorite;
  }

  static async getUserFavorites(userId: number): Promise<Favorite[]> {
    try {
      const response = await api.get(`/api/users/${userId}/favorites`);
      
      // Handle different response formats
      if (response.data && response.data.status === 'success' && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Look for array properties in the response
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          return possibleArrays[0] as Favorite[];
        }
      }
      
      // Default to empty array
      return [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  }

  static async getUserFavoritesByMethod(userId: number, method: string): Promise<Favorite[]> {
    try {
      const response = await api.get(`/api/users/${userId}/favorites/${method}`);
      
      // Handle different response formats
      if (response.data && response.data.status === 'success' && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Look for array properties in the response
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          return possibleArrays[0] as Favorite[];
        }
      }
      
      // Default to empty array
      return [];
    } catch (error) {
      console.error('Error fetching favorites by method:', error);
      return [];
    }
  }

  static async deleteFavorite(favoriteId: number, userId: number): Promise<boolean> {
    try {
      const response = await api.delete(`/api/favorites/${favoriteId}/${userId}`);
      return response.data && response.data.status === 'success';
    } catch (error) {
      console.error('Error deleting favorite:', error);
      return false;
    }
  }

  static async updateFavorite(favoriteId: number, data: Partial<Favorite>): Promise<boolean> {
    try {
      const response = await api.put(`/api/favorites/${favoriteId}`, data);
      return response.data && response.data.status === 'success';
    } catch (error) {
      console.error('Error updating favorite:', error);
      return false;
    }
  }
} 