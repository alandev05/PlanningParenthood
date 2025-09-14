import { Platform } from 'react-native';

// Configuration constants
const API_TIMEOUT = 10000; // 10 seconds
const RETRY_ATTEMPTS = 2;

// Use different URLs for different platforms with fallback options
const getBackendUrls = () => {
  if (Platform.OS === 'web') {
    return [
      'http://localhost:8001',
      'http://127.0.0.1:8001',
      'http://10.31.160.125:8001', // Your computer's actual IP
    ];
  }
  // For iOS simulator and Android emulator, try multiple IPs
  return [
    'http://10.31.160.125:8001', // Your computer's actual IP (updated)
    'http://localhost:8001',
    'http://127.0.0.1:8001',
    'http://192.168.1.100:8001', // Common home network IP
    'http://192.168.0.100:8001'  // Alternative home network IP
  ];
};

const BACKEND_URLS = getBackendUrls();
const BACKEND_URL = BACKEND_URLS[0]; // Primary URL for simple calls

export interface FamilyData {
  zip_code: string;
  child_age: number;
  budget: number;
  availability: string;
}

export interface FamilyPriorities {
  happiness: number;
  success: number;
  social: number;
  health: number;
}

export interface KidTraits {
  creativity: number;
  sociability: number;
  outdoors: number;
  energy: number;
  curiosity: number;
  kinesthetic: number;
}

export interface Recommendation {
  activity_id: string;
  title: string;
  description: string;
  category: string;
  price_monthly: number | null;
  age_min: number;
  age_max: number;
  address: string;
  phone: string;
  website: string;
  latitude: number;
  longitude: number;
  match_score: number;
  ai_explanation: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper function for making robust API calls with fallback URLs
const makeRobustApiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  let lastError: Error | null = null;
  
  // Try each backend URL
  for (const baseUrl of BACKEND_URLS) {
    for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = API_TIMEOUT + (attempt * 2000); // Increase timeout with retries
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        console.log(`🌐 API call: ${baseUrl}${endpoint} (attempt ${attempt + 1})`);
        
        const response = await fetch(`${baseUrl}${endpoint}`, {
          ...options,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ API call successful: ${baseUrl}${endpoint}`);
          return response;
        } else {
          console.log(`❌ API call failed: ${response.status} ${response.statusText}`);
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          
          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            break;
          }
        }
      } catch (error) {
        const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
        console.log(`❌ API call error: ${baseUrl}${endpoint} - ${errorMsg}`);
        lastError = error;
        
        // Exponential backoff delay before retry
        if (attempt < RETRY_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }
  
  // If we get here, all attempts failed
  throw lastError || new Error('All backend URLs failed');
};

// Create a new family profile
export const createFamily = async (familyData: FamilyData): Promise<ApiResponse<{ family_id: string }>> => {
  try {
    console.log('👨‍👩‍👧‍👦 Creating family profile:', familyData);
    
    const response = await makeRobustApiCall('/api/family', {
      method: 'POST',
      body: JSON.stringify(familyData),
    });

    const data = await response.json();

    return {
      success: true,
      data: { family_id: data.family_id },
      message: data.message,
    };
  } catch (error) {
    console.error('💥 Failed to create family profile:', error);
    return {
      success: false,
      error: error.message || 'Failed to create family profile',
    };
  }
};

// Save family priorities
export const saveFamilyPriorities = async (
  familyId: string,
  priorities: FamilyPriorities
): Promise<ApiResponse<null>> => {
  try {
    console.log('🎯 Saving family priorities:', priorities);
    
    const response = await makeRobustApiCall(`/api/family/${familyId}/priorities`, {
      method: 'POST',
      body: JSON.stringify(priorities),
    });

    const data = await response.json();

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('💥 Failed to save family priorities:', error);
    return {
      success: false,
      error: error.message || 'Failed to save family priorities',
    };
  }
};

// Save kid traits
export const saveKidTraits = async (
  familyId: string,
  traits: KidTraits
): Promise<ApiResponse<null>> => {
  try {
    console.log('🧒 Saving kid traits:', traits);
    
    const response = await makeRobustApiCall(`/api/family/${familyId}/traits`, {
      method: 'POST',
      body: JSON.stringify(traits),
    });

    const data = await response.json();

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('💥 Failed to save kid traits:', error);
    return {
      success: false,
      error: error.message || 'Failed to save kid traits',
    };
  }
};

// Get recommendations
export const getRecommendations = async (familyId: string): Promise<ApiResponse<Recommendation[]>> => {
  try {
    console.log('🎯 Getting recommendations for family:', familyId);
    
    const response = await makeRobustApiCall(`/api/recommendations?family_id=${familyId}`);
    const data = await response.json();

    return {
      success: true,
      data: data.recommendations,
    };
  } catch (error) {
    console.error('💥 Failed to get recommendations:', error);
    return {
      success: false,
      error: error.message || 'Failed to get recommendations',
    };
  }
};

// Health check
export const checkApiHealth = async (): Promise<ApiResponse<any>> => {
  try {
    console.log('🏥 Checking API health...');
    
    const response = await makeRobustApiCall('/api/health');
    const data = await response.json();

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('💥 API health check failed:', error);
    return {
      success: false,
      error: error.message || 'API health check failed',
    };
  }
};
