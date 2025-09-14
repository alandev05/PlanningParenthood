import { Platform } from 'react-native';

// Simple, clean API client
class ApiClient {
  private baseUrl: string;

  constructor() {
    // Simple logic: web uses localhost, mobile uses computer IP
    if (Platform.OS === 'web') {
      this.baseUrl = 'http://localhost:8001';
    } else {
      // For mobile, we need your computer's actual IP
      // This should be set in .env or detected automatically
      const computerIp = process.env.EXPO_PUBLIC_COMPUTER_IP || '10.189.115.63';
      this.baseUrl = `http://${computerIp}:8001`;
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        timeout: 10000,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed: ${url}`, error);
      throw error;
    }
  }

  // Convenience methods
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Specific API functions
export const createFamilyProfile = (profileData: any) => 
  apiClient.post('/api/family', profileData);

export const getPrograms = (filters?: any) => 
  apiClient.get(`/api/programs${filters ? `?${new URLSearchParams(filters)}` : ''}`);

export const generateExtraordinaryPeople = (query: string) =>
  apiClient.post('/api/extraordinary-people', { query });

export const searchNearbyPlaces = (lat: number, lng: number, type: string) =>
  apiClient.get(`/api/nearby-places?lat=${lat}&lng=${lng}&type=${type}`);
