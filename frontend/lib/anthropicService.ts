import { Platform } from 'react-native';

const getBackendUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8001';
  }
  return 'http://10.189.115.63:8001';
};

const BACKEND_URL = getBackendUrl();

export const generateExtraordinaryPeople = async (query: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/extraordinary-people`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      profiles: data.profiles || [],
      interpretation: data.interpretation || ''
    };
  } catch (error) {
    console.error('Error generating profiles:', error);
    return {
      profiles: [],
      interpretation: 'Error generating profiles'
    };
  }
};
