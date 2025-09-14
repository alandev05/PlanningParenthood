import { Platform } from 'react-native';

// Use different URLs for different platforms
const getBackendUrl = () => {
  const ip = process.env.EXPO_PUBLIC_COMPUTER_IP;
  if (ip) return `http://${ip}:8001`;
  if (Platform.OS === 'web') return 'http://localhost:8001';
  return 'http://127.0.0.1:8001';
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

type GeocodeOptions = {
  country?: string;
  locationBias?: { lat: number; lng: number; radiusMeters?: number };
};

export const geocodeAddress = async (address: string, options?: GeocodeOptions): Promise<PlaceResult[]> => {
  try {
    const params = new URLSearchParams({ address });
    if (options?.country) params.append('country', options.country);
    if (options?.locationBias) {
      params.append('lat', String(options.locationBias.lat));
      params.append('lng', String(options.locationBias.lng));
      if (options.locationBias.radiusMeters) {
        params.append('radius', String(options.locationBias.radiusMeters));
      }
    }
    const response = await fetch(`${BACKEND_URL}/api/geocode?${params.toString()}`);
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
