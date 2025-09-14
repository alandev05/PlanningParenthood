import { Platform } from 'react-native';
import { Program } from '../types';

const getBackendUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8001';
  }
  return 'http://10.189.115.63:8001';
};

const BACKEND_URL = getBackendUrl();

export const fetchProgramsFromBackend = async (filters?: {
  zip?: string;
  maxPrice?: number;
}): Promise<Program[]> => {
  try {
    let url = `${BACKEND_URL}/api/programs`;
    const params = new URLSearchParams();
    
    if (filters?.zip) params.append('zip', filters.zip);
    if (filters?.maxPrice) params.append('max_price', filters.maxPrice.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.programs || [];
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
};

export const uploadProgramsToBackend = async (programs: Program[]) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/programs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(programs),
    });
    
    if (response.ok) {
      console.log('Programs uploaded successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error uploading programs:', error);
    return false;
  }
};
