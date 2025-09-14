import { Program } from '../types';
import { getPrograms } from './apiClient';

export const fetchProgramsFromBackend = async (filters?: {
  zip?: string;
  maxPrice?: number;
}): Promise<Program[]> => {
  try {
    const data = await getPrograms(filters);
    return data.programs || [];
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
};
