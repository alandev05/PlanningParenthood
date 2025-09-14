import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SPACING } from "../../lib/theme";
import ProgramCard from "../../components/ProgramCard";
import { fetchDemoPrograms } from "../../lib/demoData";

interface Recommendation {
  activity_id: string;
  title: string;
  description: string;
  category: string;
  price_monthly: number;
  match_score: number;
  ai_explanation: string;
  developmental_benefits?: string;
  constraint_solutions?: string;
  time_commitment?: string;
  budget_breakdown?: string;
}

export default function RecommendationsTab() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Get AI recommendations from AsyncStorage
      const storedRecommendations = await AsyncStorage.getItem("latest_recommendations");
      
      if (storedRecommendations) {
        const aiRecommendations = JSON.parse(storedRecommendations);
        
        // Convert to display format
        const convertedPrograms = aiRecommendations.map((rec: Recommendation) => ({
          id: rec.activity_id,
          title: rec.title,
          priceMonthly: rec.price_monthly,
          distanceMiles: 1.5,
          ageRange: [3, 8] as [number, number],
          why: rec.ai_explanation,
          address: "Local area",
          phone: "Contact for details",
          latitude: 42.3601,
          longitude: -71.0589,
          matchScore: rec.match_score,
          category: rec.category,
          developmentalBenefits: rec.developmental_benefits,
          constraintSolutions: rec.constraint_solutions,
          timeCommitment: rec.time_commitment,
          budgetBreakdown: rec.budget_breakdown,
        }));
        
        setRecommendations(convertedPrograms);
      } else {
        // Fallback to demo data
        const demoData = fetchDemoPrograms({
          zip: "02139",
          age: 5,
          maxDistance: 10,
          maxBudget: 1000,
        });
        setRecommendations(demoData);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => 
    filter === "all" || rec.category === filter
  );

  const categories = ["all", "physical", "cognitive", "emotional", "social"];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="rgba(255,79,97,1)" />
          <Text style={styles.loadingText}>Loading your personalized recommendations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your AI Recommendations</Text>
        <Text style={styles.subtitle}>
          {recommendations.length} personalized activities across 4 development areas
        </Text>
      </View>

      {/* Category Filters */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                filter === item && styles.filterChipActive
              ]}
              onPress={() => setFilter(item)}
            >
              <Text style={[
                styles.filterText,
                filter === item && styles.filterTextActive
              ]}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Recommendations List */}
      <FlatList
        data={filteredRecommendations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProgramCard
            program={item}
            onPress={() => {
              // Navigate to detail view
              console.log("Navigate to detail:", item.id);
            }}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    color: "#666",
    fontSize: 16,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#333",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: "rgba(255,79,97,1)",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
});