import { generateExtraordinaryPeople as apiGenerateExtraordinaryPeople, apiClient } from './apiClient';

export const generateExtraordinaryPeople = async (query: string) => {
  try {
    const data = await apiGenerateExtraordinaryPeople(query);
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

export const generateDeepResearch = async (query: string) => {
  try {
    const data = await apiClient.post('/api/deep-research', { query });
    return {
      profiles: data.profiles || [],
      interpretation: data.interpretation || ''
    };
  } catch (error) {
    console.error('Error generating deep research:', error);
    return {
      profiles: [],
      interpretation: 'Error generating research'
    };
  }
};
