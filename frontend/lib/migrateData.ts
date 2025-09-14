import { demoPrograms } from './demoData';
import { uploadProgramsToFirebase } from './firebaseService';

export const migrateDemoDataToFirebase = async () => {
  console.log('Migrating demo data to Firebase...');
  await uploadProgramsToFirebase(demoPrograms);
  console.log('Migration complete!');
};

// Uncomment to run migration
// migrateDemoDataToFirebase();
