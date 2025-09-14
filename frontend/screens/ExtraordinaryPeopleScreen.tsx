import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
} from "react-native";
import Header from "../components/Header";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import ProfileCard from "../components/ProfileCard";
import {
  generateExtraordinaryPeople,
  generateDeepResearch,
} from "../lib/anthropicService";
import { CacheService } from "../lib/cacheService";

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
  hasChildren?: boolean;
  childrenSummary?: string;
  stats?: {
    founded?: string;
    employees?: string;
    charitable_giving?: string;
    books_written?: string;
  };
  parentingLessons?: string[];
  parentingTechniques?: string[];
  familyBackground?: string;
  inspirationalQuotes?: string[];
  communityImpact?: string;
};

const EXAMPLE_SEARCHES = [
  "entrepreneurs who overcame adversity",
  "scientists who changed the world",
  "artists from diverse backgrounds",
  "social activists and changemakers",
  "tech innovators and founders",
];

export default function ExtraordinaryPeopleScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<ExtraordinaryPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInterpretation, setSearchInterpretation] = useState("");
  const [searchMode, setSearchMode] = useState<"general" | "specific">(
    "general"
  );
  const [researchQuery, setResearchQuery] = useState("");
  const [error, setError] = useState("");
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);
  const [modalProfile, setModalProfile] = useState<ExtraordinaryPerson | null>(
    null
  );

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      setProfiles([]);
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Check cache first
      const cachedProfiles = await CacheService.getCachedSearch(searchTerm);
      if (cachedProfiles) {
        setProfiles(cachedProfiles);
        setIsLoading(false);
        return;
      }

      // If not cached, make API call
      console.log("🔍 Searching for:", searchTerm);
      const result = await generateExtraordinaryPeople(searchTerm);

      console.log("📊 Search result:", result);
      setProfiles(result.profiles);

      // Cache the results
      if (result.profiles.length > 0) {
        await CacheService.setCachedSearch(searchTerm, result.profiles);
      }

      if (result.profiles.length === 0) {
        setError(
          "No profiles found. Try a different search term or check your connection."
        );
      }
    } catch (error) {
      console.error("❌ Search error:", error);
      setError("Failed to search for profiles. Please try again.");
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepResearch = async () => {
    if (!researchQuery.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      // Check cache first
      const cacheKey = `research_${researchQuery}`;
      const cachedProfiles = await CacheService.getCachedSearch(cacheKey);
      if (cachedProfiles) {
        setProfiles(cachedProfiles);
        setIsLoading(false);
        return;
      }

      console.log("🔬 Deep researching:", researchQuery);
      const result = await generateDeepResearch(researchQuery);

      setProfiles(result.profiles);

      if (result.profiles.length > 0) {
        await CacheService.setCachedSearch(cacheKey, result.profiles);
      } else {
        setError(
          "No detailed information found. Try a different name or organization."
        );
      }
    } catch (error) {
      console.error("❌ Research error:", error);
      setError("Failed to research. Please try again.");
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepResearchFromProfile = async (profileName: string) => {
    setSearchMode("specific");
    setResearchQuery(profileName);
    setExpandedProfile(null);

    setIsLoading(true);
    setError("");

    try {
      const cacheKey = `research_${profileName}`;
      const cachedProfiles = await CacheService.getCachedSearch(cacheKey);
      if (cachedProfiles) {
        setProfiles(cachedProfiles);
        setIsLoading(false);
        return;
      }

      console.log("🔬 Deep researching from profile:", profileName);
      const result = await generateDeepResearch(profileName);

      setProfiles(result.profiles);

      if (result.profiles.length > 0) {
        await CacheService.setCachedSearch(cacheKey, result.profiles);
      } else {
        setError(
          "No detailed information found. Try a different name or organization."
        );
      }
    } catch (error) {
      console.error("❌ Research error:", error);
      setError("Failed to research. Please try again.");
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
      <Header
        title="Extraordinary People"
        subtitle="Find inspiring role models"
      />

      <View style={styles.searchContainer}>
        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              searchMode === "general" && styles.modeButtonActive,
            ]}
            onPress={() => setSearchMode("general")}
          >
            <Text
              style={[
                styles.modeButtonText,
                searchMode === "general" && styles.modeButtonTextActive,
              ]}
            >
              General Search
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              searchMode === "specific" && styles.modeButtonActive,
            ]}
            onPress={() => setSearchMode("specific")}
          >
            <Text
              style={[
                styles.modeButtonText,
                searchMode === "specific" && styles.modeButtonTextActive,
              ]}
            >
              Deep Research
            </Text>
          </TouchableOpacity>
        </View>

        {searchMode === "general" ? (
          <>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for inspiring people... (e.g., 'entrepreneurs', 'scientists', 'artists')"
                value={searchQuery}
                onChangeText={setSearchQuery}
                multiline={false}
              />

              {searchQuery.trim() && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchQuery("");
                    setProfiles([]);
                    setError("");
                  }}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.searchButton, (!searchQuery.trim() || isLoading) && styles.searchButtonDisabled]} 
                onPress={() => handleSearch()}
                disabled={isLoading || !searchQuery.trim()}
              >
                <Text style={styles.searchButtonText}>
                  {isLoading ? 'Searching...' : 'Search'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.searchRow}>
              <TextInput
                style={[styles.searchInput, { flex: 1 }]}
                placeholder="Research specific person/company... (e.g., 'Elon Musk', 'Tesla Inc', 'Bill Gates')"
                value={researchQuery}
                onChangeText={setResearchQuery}
                multiline={false}
              />

              {researchQuery.trim() && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setResearchQuery("");
                    setProfiles([]);
                    setError("");
                  }}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.searchButton, styles.researchButton]}
              onPress={handleDeepResearch}
              disabled={isLoading || !researchQuery.trim()}
            >
              <Text style={styles.searchButtonText}>
                {isLoading ? "Researching..." : "🔬 Deep Research"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Example searches - only in general mode */}
      {searchMode === 'general' && profiles.length === 0 && !isLoading && !searchQuery.trim() && (
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Try searching for:</Text>
          <View style={styles.examplesGrid}>
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
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            Finding extraordinary people...
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.profilesContainer}
        showsVerticalScrollIndicator={false}
      >
        {!isLoading &&
          profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isExpanded={expandedProfile === profile.id}
              showDeepResearchButton={searchMode === "general"}
              onPress={() => {
                // Open fullscreen modal for easier reading
                setModalProfile(profile);
              }}
              onDeepResearch={handleDeepResearchFromProfile}
            />
          ))}

        {!isLoading &&
          profiles.length === 0 &&
          searchQuery.trim() &&
          !error && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No profiles found. Try a different search term.
              </Text>
            </View>
          )}
      </ScrollView>

      {/* Fullscreen profile modal */}
      <Modal
        visible={!!modalProfile}
        animationType="slide"
        onRequestClose={() => setModalProfile(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setModalProfile(null)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            {modalProfile && (
              <ProfileCard
                profile={modalProfile}
                isExpanded={true}
                showDeepResearchButton={true}
                onDeepResearch={handleDeepResearchFromProfile}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFF8F5',
  },
  modeToggle: {
    flexDirection: "row",
    marginBottom: 16,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#FF4F61',
    shadowColor: '#FF4F61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#FFE5E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  clearButton: {
    marginLeft: 8,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  clearButtonText: {
    color: '#6C757D',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#FF4F61',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#FF4F61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  researchButton: {
    backgroundColor: '#6EBAA6',
  },
  errorText: {
    color: '#FF4F61',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginRight: 8,
    marginBottom: 8,
  },
  exampleText: {
    color: '#495057',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  examplesContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  examplesTitle: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  exampleText: {
    color: '#495057',
    fontSize: 14,
  },
  profilesContainer: {
    flex: 1,
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalCloseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  modalScroll: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
});
