import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import ProfileCard from '../components/ProfileCard';
import { generateExtraordinaryPeople } from '../lib/anthropicService';

export type ExtraordinaryPerson = {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  backstory: string;
  achievements: string[];
  linkedinUrl: string;
  imageUrl?: string;
  tags: string[];
};

export default function ExtraordinaryPeopleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<ExtraordinaryPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInterpretation, setSearchInterpretation] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setProfiles([]);
      setSearchInterpretation('');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await generateExtraordinaryPeople(searchQuery);
      setProfiles(result.profiles);
      setSearchInterpretation(result.interpretation);
    } catch (error) {
      console.error('Search error:', error);
      setProfiles([]);
      setSearchInterpretation('Error searching for profiles');
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time search with debounce
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 1000);

      return () => clearTimeout(timeoutId);
    } else {
      setProfiles([]);
      setSearchInterpretation('');
      setIsLoading(false);
    }
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <Header title="Extraordinary People" subtitle="Find inspiring role models" />
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for inspiring people... (e.g., 'entrepreneurs', 'scientists', 'artists')"
          value={searchQuery}
          onChangeText={setSearchQuery}
          multiline={false}
        />
        
        {searchInterpretation ? (
          <Text style={styles.interpretation}>{searchInterpretation}</Text>
        ) : null}
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Finding extraordinary people...</Text>
        </View>
      )}

      <ScrollView style={styles.profilesContainer}>
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onPress={() => {
              // Navigate to profile detail or open LinkedIn
              console.log('Profile pressed:', profile.name);
            }}
          />
        ))}
        
        {!isLoading && profiles.length === 0 && searchQuery.trim() && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No profiles found. Try a different search term.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  interpretation: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  profilesContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});
