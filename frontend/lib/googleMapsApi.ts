import { Platform } from 'react-native';

// Use different URLs for different platforms
const getBackendUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8001';
  }
  // For iOS simulator and Android emulator, use your computer's IP
  return 'http://10.189.115.63:8001';
};

const BACKEND_URL = getBackendUrl();

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export const geocodeAddress = async (address: string): Promise<PlaceResult[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/geocode?address=${encodeURIComponent(address)}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

export const searchNearbyPlaces = async (
  latitude: number,
  longitude: number,
  type: string = 'hospital',
  radius: number = 5000
): Promise<PlaceResult[]> => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/nearby-places?lat=${latitude}&lng=${longitude}&type=${type}&radius=${radius}`
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Places search error:', error);
    return [];
  }
};
