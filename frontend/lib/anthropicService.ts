import { generateExtraordinaryPeople as apiGenerateExtraordinaryPeople } from './apiClient';

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
