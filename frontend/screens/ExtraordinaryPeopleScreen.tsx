import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import ProfileCard from '../components/ProfileCard';
import { generateExtraordinaryPeople } from '../lib/anthropicService';
import { CacheService } from '../lib/cacheService';

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

const EXAMPLE_SEARCHES = [
  'entrepreneurs who overcame adversity',
  'scientists who changed the world',
  'artists from diverse backgrounds',
  'social activists and changemakers',
  'tech innovators and founders'
];

export default function ExtraordinaryPeopleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<ExtraordinaryPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInterpretation, setSearchInterpretation] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      setProfiles([]);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Check cache first
      const cachedProfiles = await CacheService.getCachedSearch(searchTerm);
      if (cachedProfiles) {
        setProfiles(cachedProfiles);
        setIsLoading(false);
        return;
      }

      // If not cached, make API call
      console.log('🔍 Searching for:', searchTerm);
      const result = await generateExtraordinaryPeople(searchTerm);
      
      console.log('📊 Search result:', result);
      setProfiles(result.profiles);
      
      // Cache the results
      if (result.profiles.length > 0) {
        await CacheService.setCachedSearch(searchTerm, result.profiles);
      }
      
      if (result.profiles.length === 0) {
        setError('No profiles found. Try a different search term or check your connection.');
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setError('Failed to search for profiles. Please try again.');
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleSearch = (example: string) => {
    setSearchQuery(example);
    handleSearch(example);
  };

  return (
    <View style={styles.container}>
      <Header title="Extraordinary People" subtitle="Find inspiring role models" />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.searchInput, { flex: 1 }]}
            placeholder="Search for inspiring people... (e.g., 'entrepreneurs', 'scientists', 'artists')"
            value={searchQuery}
            onChangeText={setSearchQuery}
            multiline={false}
          />
          
          {searchQuery.trim() && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => {
                setSearchQuery('');
                setProfiles([]);
                setError('');
              }}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={() => handleSearch()}
          disabled={isLoading || !searchQuery.trim()}
        >
          <Text style={styles.searchButtonText}>
            {isLoading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
      </View>

      {/* Example searches */}
      {profiles.length === 0 && !isLoading && !searchQuery.trim() && (
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Try searching for:</Text>
          {EXAMPLE_SEARCHES.map((example, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exampleButton}
              onPress={() => handleExampleSearch(example)}
            >
              <Text style={styles.exampleText}>{example}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Finding extraordinary people...</Text>
        </View>
      )}

      <ScrollView style={styles.profilesContainer} showsVerticalScrollIndicator={false}>
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onPress={() => {
              Alert.alert(
                profile.name,
                `${profile.title} at ${profile.company}\n\n${profile.backstory}`,
                [
                  { text: 'Close', style: 'cancel' },
                  { text: 'View LinkedIn', onPress: () => console.log('Open LinkedIn:', profile.linkedinUrl) }
                ]
              );
            }}
          />
        ))}
        
        {!isLoading && profiles.length === 0 && searchQuery.trim() && !error && (
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  clearButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  interpretation: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ff4444',
  },
  examplesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  exampleButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#007AFF',
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
    textAlign: 'center',
  },
});
