import { Program } from '../types';

// Simple Firebase service - replace with your Firebase config
const FIREBASE_URL = 'https://your-project.firebaseio.com'; // Replace with your Firebase URL

export const uploadProgramsToFirebase = async (programs: Program[]) => {
  try {
    const response = await fetch(`${FIREBASE_URL}/programs.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(programs),
    });
    
    if (response.ok) {
      console.log('Programs uploaded to Firebase successfully');
    }
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
  }
};

export const fetchProgramsFromFirebase = async (): Promise<Program[]> => {
  try {
    const response = await fetch(`${FIREBASE_URL}/programs.json`);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data;
    }
    
    // Convert object to array if needed
    return Object.values(data || {}) as Program[];
  } catch (error) {
    console.error('Error fetching from Firebase:', error);
    return [];
  }
};
