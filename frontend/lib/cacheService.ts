import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExtraordinaryPerson } from '../screens/ExtraordinaryPeopleScreen';

interface CachedSearch {
  query: string;
  profiles: ExtraordinaryPerson[];
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY_PREFIX = 'extraordinary_search_';

export class CacheService {
  static async getCachedSearch(query: string): Promise<ExtraordinaryPerson[] | null> {
    try {
      const cacheKey = CACHE_KEY_PREFIX + query.toLowerCase().trim();
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const data: CachedSearch = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp > CACHE_DURATION) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
      
      console.log('📦 Using cached results for:', query);
      return data.profiles;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  static async setCachedSearch(query: string, profiles: ExtraordinaryPerson[]): Promise<void> {
    try {
      const cacheKey = CACHE_KEY_PREFIX + query.toLowerCase().trim();
      const data: CachedSearch = {
        query,
        profiles,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      console.log('💾 Cached results for:', query);
    } catch (error) {
      console.error('Error writing cache:', error);
    }
  }

  static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('🗑️ Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}
