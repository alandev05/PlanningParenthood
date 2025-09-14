import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WelcomeScreen from './screens/WelcomeScreen';
import IntakeScreen from './screens/IntakeScreen';
import KidQuizModal from './screens/KidQuizModel';
import RoadmapScreen from './screens/RoadmapScreen';
import ResultsTabNavigator from './screens/ResultsTabNavigator';
import ProgramDetailScreen from './screens/ProgramDetailScreen';
import ExtraordinaryPeopleScreen from './screens/ExtraordinaryPeopleScreen';
import MapScreen from './screens/MapScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Intake: { zip?: string; age?: number } | undefined;
  KidQuiz: { onComplete?: (weights: Record<string, number>) => void } | undefined;
  Roadmap: { familyId?: string } | undefined;
  Results: { zip?: string; age?: number; demo?: boolean; familyId?: string; fromRoadmap?: boolean } | undefined;
  ProgramDetail: { id: string };
  ExtraordinaryPeople: undefined;
  Map: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Intake" component={IntakeScreen} />
          <Stack.Screen name="KidQuiz" component={KidQuizModal} />
          <Stack.Screen name="Roadmap" component={RoadmapScreen} />
          <Stack.Screen name="Results" component={ResultsTabNavigator} />
          <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
          <Stack.Screen name="ExtraordinaryPeople" component={ExtraordinaryPeopleScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
