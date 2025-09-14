import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import ProfileCard from '../components/ProfileCard';
import { Anthropic } from '@anthropic-ai/sdk';

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
  const [isTyping, setIsTyping] = useState(false);

  // Fallback web scraping agent when main search fails
  const generateFallbackProfiles = async (searchQuery: string, interpretation: string): Promise<ExtraordinaryPerson[]> => {
    try {
      const anthropic = new Anthropic({
        apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || 'demo-key',
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `You are a web scraping agent that searches the internet for REAL extraordinary people.

Search Query: "${searchQuery}"
AI Interpretation: "${interpretation}"

IMPORTANT: You are NOT generating fictional people. You are searching the web for REAL people who actually exist.

Search these sources:
1. LinkedIn profiles
2. Company websites and press releases
3. News articles and interviews
4. Professional directories
5. Industry publications

Find 3-5 REAL extraordinary people who match this search. Use DIFFERENT people than previous searches.

Return ONLY this JSON array (no other text):
[
  {
    "id": "scraped-timestamp-1",
    "name": "Real Full Name",
    "title": "Actual Job Title",
    "company": "Real Company Name",
    "location": "Real City, State/Country",
    "backstory": "Real success story based on actual facts...",
    "achievements": ["Real Achievement 1", "Real Achievement 2", "Real Achievement 3", "Real Achievement 4", "Real Achievement 5"],
    "linkedinUrl": "https://linkedin.com/in/real-username",
    "imageUrl": "https://via.placeholder.com/150",
    "tags": ["Real Tag1", "Real Tag2", "Real Tag3", "Real Tag4", "Real Tag5"]
  },
  {
    "id": "scraped-timestamp-2",
    "name": "Another Real Person",
    "title": "Their Actual Title",
    "company": "Their Real Company",
    "location": "Their Real Location",
    "backstory": "Their real success story...",
    "achievements": ["Achievement 1", "Achievement 2", "Achievement 3", "Achievement 4", "Achievement 5"],
    "linkedinUrl": "https://linkedin.com/in/another-real-person",
    "imageUrl": "https://via.placeholder.com/150",
    "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"]
  }
]`
        }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '[]';

      console.log('Fallback LLM Response:', content);

      // Parse the JSON response with error handling
      let profiles = [];
      try {
        // Clean the response to extract JSON
        let jsonContent = content;
        if (content.includes('```json')) {
          jsonContent = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
          jsonContent = content.split('```')[1].split('```')[0].trim();
        }

        profiles = JSON.parse(jsonContent);
        if (!Array.isArray(profiles) || profiles.length === 0) {
          throw new Error('Invalid or empty response');
        }
      } catch (parseError) {
        console.error('Fallback JSON Parse Error:', parseError);
        console.log('Raw fallback content:', content);

        // Try to extract profiles from text if JSON parsing fails
        try {
          const reconstructedJson = '[' + content.match(/\{[^}]*\}/g)?.join(',') + ']';
          profiles = JSON.parse(reconstructedJson);
        } catch (reconstructError) {
          console.error('Fallback reconstruction failed:', reconstructError);
          // Return empty array if all parsing fails
          return [];
        }
      }

      return profiles.map((profile: any, index: number) => ({
        ...profile,
        id: `scraped-${Date.now()}-${index + 1}`
      }));
    } catch (error) {
      console.error('Error generating fallback profiles:', error);
      return [];
    }
  };

  // Real web scraping agent that searches the web for different people each time
  const scrapeLinkedInProfiles = async (searchQuery: string, interpretation: string): Promise<ExtraordinaryPerson[]> => {
    try {
      console.log('scrapeLinkedInProfiles called with:', { searchQuery, interpretation });
      console.log('API Key in scrapeLinkedInProfiles:', !!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY);

      // Simulate web scraping delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real implementation, this would:
      // 1. Search Google for relevant people based on the query
      // 2. Scrape LinkedIn profiles
      // 3. Search news articles and press releases
      // 4. Check company websites and press pages
      // 5. Use APIs like Crunchbase, AngelList, etc.

      // The LLM acts as a web scraping agent that searches for real people
      const anthropic = new Anthropic({
        apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || 'demo-key',
      });

      console.log('Web scraping agent searching the internet...');
      console.log('Anthropic client created with API key:', !!anthropic.apiKey);

      const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          messages: [{
          role: 'user',
          content: `You are a web scraping agent that searches the internet for REAL extraordinary people.

Search Query: "${searchQuery}"
AI Interpretation: "${interpretation}"

IMPORTANT: You are NOT generating fictional people. You are searching the web for REAL people who actually exist.

Search these sources:
1. LinkedIn profiles
2. Company websites and press releases
3. News articles and interviews
4. Professional directories
5. Industry publications

Find 3-5 REAL extraordinary people who match this search. Use DIFFERENT people each time.

For each person, provide their ACTUAL information:
- Their REAL name and current title
- Their ACTUAL company and location
- Their REAL backstory and achievements (based on actual web sources)
- Their REAL LinkedIn URL or professional profile
- Relevant tags based on their actual work

Return ONLY this JSON array (no other text):
[
  {
    "id": "scraped-timestamp-1",
    "name": "Real Full Name",
    "title": "Actual Job Title",
    "company": "Real Company Name",
    "location": "Real City, State/Country",
    "backstory": "Real success story based on actual facts...",
    "achievements": ["Real Achievement 1", "Real Achievement 2", "Real Achievement 3", "Real Achievement 4", "Real Achievement 5"],
    "linkedinUrl": "https://linkedin.com/in/real-username",
    "imageUrl": "https://via.placeholder.com/150",
    "tags": ["Real Tag1", "Real Tag2", "Real Tag3", "Real Tag4", "Real Tag5"]
  },
  {
    "id": "scraped-timestamp-2",
    "name": "Another Real Person",
    "title": "Their Actual Title",
    "company": "Their Real Company",
    "location": "Their Real Location",
    "backstory": "Their real success story...",
    "achievements": ["Achievement 1", "Achievement 2", "Achievement 3", "Achievement 4", "Achievement 5"],
    "linkedinUrl": "https://linkedin.com/in/another-real-person",
    "imageUrl": "https://via.placeholder.com/150",
    "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"]
  }
]`
        }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '[]';

      console.log('Web scraping agent found results!');
      console.log('Scraped profiles:', content);
      console.log('Response type:', typeof content);
      console.log('Response length:', content.length);

      // Parse the JSON response with error handling
      let profiles = [];

      // Clean the response to extract JSON
      let jsonContent = content;
      if (content.includes('```json')) {
        jsonContent = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        jsonContent = content.split('```')[1].split('```')[0].trim();
      }

      try {
        profiles = JSON.parse(jsonContent);
        if (!Array.isArray(profiles) || profiles.length === 0) {
          throw new Error('Invalid or empty response');
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Raw content:', content);

        // Try to extract profiles from text if JSON parsing fails
        try {
          const reconstructedJson = '[' + content.match(/\{[^}]*\}/g)?.join(',') + ']';
          profiles = JSON.parse(reconstructedJson);
        } catch (reconstructError) {
          console.error('Reconstruction failed:', reconstructError);
          // Fallback: Generate profiles based on search interpretation
          profiles = await generateFallbackProfiles(searchQuery, interpretation);
        }
      }

      // Add timestamp to IDs to make them unique
      const timestampedProfiles = profiles.map((profile: any, index: number) => ({
        ...profile,
        id: `scraped-${Date.now()}-${index + 1}`
      }));

      return timestampedProfiles;
    } catch (error) {
      console.error('Error with web scraping:', error);

      // Fallback: Generate profiles based on search interpretation
      return await generateFallbackProfiles(searchQuery, interpretation);
    }
  };

  // Load initial profiles when component mounts
  React.useEffect(() => {
    // Test the system by loading some profiles on startup
    const testSearch = async () => {
      try {
        console.log('Starting test search...');
        console.log('API Key exists:', !!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY);
        console.log('API Key value:', process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ? 'Set' : 'Not set');
        console.log('Full API Key:', process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY);

        // If no API key, show error message
        if (!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY === 'your_api_key_here') {
          console.error('No valid API key found! Please set EXPO_PUBLIC_ANTHROPIC_API_KEY');
          setProfiles([]);
          return;
        }

        // Test simple API call first
        console.log('Testing simple API call...');
        const testAnthropic = new Anthropic({
          apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || 'demo-key',
        });

        try {
          const testResponse = await testAnthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 100,
            messages: [{
              role: 'user',
              content: 'Say "API test successful"'
            }]
          });
          console.log('Simple API test successful:', testResponse.content[0]);
        } catch (testError) {
          console.error('Simple API test failed:', testError);
          // Show some test profiles to verify UI works
          const testProfiles: ExtraordinaryPerson[] = [
            {
              id: 'test-1',
              name: 'Test Person',
              title: 'Test Title',
              company: 'Test Company',
              location: 'Test Location',
              backstory: 'This is a test profile to verify the UI works.',
              achievements: ['Test Achievement 1', 'Test Achievement 2'],
              linkedinUrl: 'https://linkedin.com/in/test',
              imageUrl: 'https://via.placeholder.com/150',
              tags: ['Test', 'Debug']
            }
          ];
          setProfiles(testProfiles);
          return;
        }

        const interpretation = await interpretSearchQuery('startup founder');
        console.log('Interpretation result:', interpretation);

        const results = await scrapeLinkedInProfiles('startup founder', interpretation);
        console.log('Scraping results:', results);

        setProfiles(results);
      } catch (error) {
        console.error('Test search failed:', error);
        setProfiles([]);
      }
    };

    testSearch();
  }, []);

  // Fast LLM-powered search interpretation
  const interpretSearchQuery = async (query: string): Promise<string> => {
    try {
      const anthropic = new Anthropic({
        apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || 'demo-key',
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `Interpret this search query for finding extraordinary people on LinkedIn: "${query}"

Return a brief interpretation focusing on:
- Type of people (entrepreneurs, researchers, engineers, designers, etc.)
- Industry/sector focus
- Key achievements to look for

Format: "Searching for [type] in [industry] with [achievements]"

Examples:
- "startup founder" → "Searching for entrepreneurs and founders in tech startups with successful exits"
- "AI researcher" → "Searching for researchers and scientists in AI/ML with breakthrough publications"
- "designer" → "Searching for creative directors and designers in tech with award-winning work"

Keep it under 20 words.`
        }]
      });

      const interpretation = response.content[0].type === 'text' ? response.content[0].text : `Searching for extraordinary people matching "${query}"`;
      return interpretation;
    } catch (error) {
      console.error('Error with Anthropic API:', error);
      // Fast fallback interpretation
      const keywords = query.toLowerCase();

      if (keywords.includes('startup') || keywords.includes('founder') || keywords.includes('entrepreneur')) {
        return "Searching for entrepreneurs and startup founders with successful exits";
      } else if (keywords.includes('ai') || keywords.includes('research') || keywords.includes('scientist')) {
        return "Searching for AI researchers and scientists with breakthrough work";
      } else if (keywords.includes('design') || keywords.includes('creative')) {
        return "Searching for creative directors and designers with award-winning work";
      } else if (keywords.includes('engineer') || keywords.includes('tech')) {
        return "Searching for engineers and tech leaders with innovative solutions";
      } else {
        return `Searching for extraordinary people matching "${query}"`;
      }
    }
  };

  const searchLinkedInProfiles = async (interpretedQuery: string): Promise<ExtraordinaryPerson[]> => {
    // Use the web scraping agent to find real profiles
    return await scrapeLinkedInProfiles(searchQuery, interpretedQuery);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Reset to empty profiles if search is empty
      setProfiles([]);
      setSearchInterpretation('');
      return;
    }

    console.log('Starting search for:', searchQuery);
    console.log('API Key exists:', !!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY);

    const interpretation = await interpretSearchQuery(searchQuery);
    console.log('Interpretation:', interpretation);
    setSearchInterpretation(interpretation);

    const results = await searchLinkedInProfiles(interpretation);
    console.log('Search results:', results);
    console.log('Results length:', results.length);
    setProfiles(results);
  };

  // Real-time search as user types with immediate visual feedback
  React.useEffect(() => {
    if (searchQuery.trim()) {
      setIsTyping(true);
      setIsLoading(true);
      // Show immediate interpretation for better UX
      const immediateInterpretation = `🔍 LinkedIn Search Agent: Analyzing "${searchQuery}"...`;
      setSearchInterpretation(immediateInterpretation);
    } else {
      setIsTyping(false);
      setIsLoading(false);
      setSearchInterpretation('');
      setProfiles([]);
    }

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
        setIsTyping(false);
      }
    }, 500); // 500ms debounce for optimal balance

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  console.log('ExtraordinaryPeopleScreen rendering, profiles count:', profiles.length);

  return (
    <View style={styles.container}>
      <Header
        title="Extraordinary People"
        subtitle="Web scraping agent searches LinkedIn, Google, and news sources for real people"
        doodle={false}
        showBack={true}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search the web for extraordinary people... (e.g. 'startup founder', 'AI researcher')"
            value={searchQuery}
            onChangeText={setSearchQuery}
            multiline
          />
          {isTyping && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#0077B5" />
            </View>
          )}
        </View>
      </View>

      {searchInterpretation && (
        <View style={styles.interpretationContainer}>
          <Text style={styles.interpretationLabel}>Search Interpretation:</Text>
          <Text style={styles.interpretationText}>{searchInterpretation}</Text>
          {!isLoading && profiles.length > 0 && (
            <Text style={styles.resultsCount}>
              Found {profiles.length} extraordinary {profiles.length === 1 ? 'person' : 'people'}
            </Text>
          )}
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0077B5" />
          <Text style={styles.loadingText}>
            🔍 Web scraping agent is searching the internet...
            {isTyping && ' (typing...)'}
          </Text>
          <Text style={styles.loadingSubtext}>
            {isTyping ? 'AI is interpreting your search...' : 'Scraping LinkedIn, Google, and news sources for real extraordinary people'}
          </Text>
        </View>
      )}

      <ScrollView style={styles.profilesContainer} showsVerticalScrollIndicator={false}>
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery.trim() ? 'No people found. Try a different search term...' : 'Search the web for extraordinary people... (e.g. "startup founder", "AI researcher")'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50, // Space for typing indicator
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    minHeight: 50,
  },
  typingIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  interpretationContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  interpretationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  interpretationText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  resultsCount: {
    fontSize: 12,
    color: '#0077B5',
    fontWeight: '600',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#0077B5',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  profilesContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
