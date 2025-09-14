import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import Header from "../components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPACING } from "../lib/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Recommendation } from "../lib/apiService";

export default function RoadmapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const params: any = route.params;

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [familyData, setFamilyData] = useState<any>(null);

  useEffect(() => {
    loadRoadmapData();
  }, []);

  const loadRoadmapData = async () => {
    try {
      setLoading(true);
      console.log("📱 Loading roadmap data from AsyncStorage...");
      
      // Get recommendations from AsyncStorage (stored by IntakeScreen)
      const storedRecommendations = await AsyncStorage.getItem("latest_recommendations");
      if (storedRecommendations) {
        try {
          const recs = JSON.parse(storedRecommendations);
          
          // Validate the recommendations data structure
          if (Array.isArray(recs) && recs.length > 0) {
            console.log(`✅ Loaded ${recs.length} recommendations from storage`);
            setRecommendations(recs);
          } else {
            console.warn("⚠️ Invalid recommendations data structure");
            setRecommendations([]);
          }
        } catch (parseError) {
          console.error("❌ Failed to parse recommendations JSON:", parseError);
          setRecommendations([]);
        }
      } else {
        console.log("ℹ️ No stored recommendations found");
        setRecommendations([]);
      }

      // Get family data if available
      const familyId = await AsyncStorage.getItem("current_family_id");
      if (familyId) {
        console.log(`👨‍👩‍👧‍👦 Found family ID: ${familyId}`);
        setFamilyData({ familyId });
      } else {
        console.log("ℹ️ No family ID found in storage");
        setFamilyData(null);
      }

    } catch (error) {
      console.error("💥 Error loading roadmap data:", error);
      
      // Provide user-friendly error handling
      Alert.alert(
        "Loading Error",
        "We had trouble loading your recommendations. Would you like to try again?",
        [
          { text: "Retry", onPress: loadRoadmapData },
          { text: "Continue", onPress: () => setRecommendations([]) }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartJourney = () => {
    // Navigate to Results screen to see the full list
    navigation.navigate("Results", { 
      familyId: familyData?.familyId,
      fromRoadmap: true 
    });
  };

  const handleBackToIntake = () => {
    navigation.navigate("Intake");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Header
          title="Your Roadmap"
          subtitle="Creating your personalized plan..."
          doodle={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="rgba(255,79,97,1)" />
          <Text style={styles.loadingText}>Building your roadmap...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header
        title="Your Roadmap"
        subtitle="Personalized recommendations for your child"
        doodle={false}
      />

      <View style={styles.content}>
        {/* Success Message */}
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>🎉 Your Roadmap is Ready!</Text>
          <Text style={styles.successText}>
            Based on your preferences and priorities, we've created a personalized plan 
            with {recommendations.length} recommended activities for your child.
          </Text>
        </View>

        {/* Top Recommendations Preview */}
        {recommendations.length > 0 ? (
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Top Recommendations</Text>
            
            {recommendations.slice(0, 3).map((rec, index) => (
              <View key={rec.activity_id} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationTitle}>{rec.title}</Text>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>
                      {Math.round(rec.match_score * 100)}% match
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.recommendationDescription}>
                  {rec.description}
                </Text>
                
                <View style={styles.recommendationMeta}>
                  <Text style={styles.recommendationPrice}>
                    {rec.price_monthly ? `$${rec.price_monthly}/month` : "Free"}
                  </Text>
                  <Text style={styles.recommendationCategory}>
                    {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}
                  </Text>
                </View>
                
                <Text style={styles.recommendationExplanation}>
                  {rec.ai_explanation}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateSection}>
            <Text style={styles.emptyStateTitle}>🔍 No Recommendations Yet</Text>
            <Text style={styles.emptyStateText}>
              We weren't able to load your personalized recommendations right now. 
              This could be due to a connection issue or server maintenance.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadRoadmapData}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {recommendations.length > 0 ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartJourney}
            >
              <Text style={styles.primaryButtonText}>
                View All Recommendations
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToIntake}
            >
              <Text style={styles.primaryButtonText}>
                Retake Quiz
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackToIntake}
          >
            <Text style={styles.secondaryButtonText}>
              Modify My Preferences
            </Text>
          </TouchableOpacity>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsSection}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Review all recommendations</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Contact programs that interest you</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Start your child's journey!</Text>
            </View>
          </View>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  successCard: {
    backgroundColor: "rgba(110,186,166,0.1)",
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: "rgba(110,186,166,1)",
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  recommendationsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.md,
  },
  recommendationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    marginRight: SPACING.sm,
  },
  matchBadge: {
    backgroundColor: "rgba(110,186,166,1)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  recommendationDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  recommendationMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  recommendationPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,79,97,1)",
  },
  recommendationCategory: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  recommendationExplanation: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
    lineHeight: 18,
  },
  actionsContainer: {
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: "rgba(255,79,97,1)",
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  nextStepsSection: {
    marginBottom: SPACING.lg,
  },
  stepsList: {
    marginTop: SPACING.sm,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,79,97,1)",
    color: "#fff",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 12,
    fontWeight: "700",
    marginRight: SPACING.md,
  },
  stepText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  emptyStateSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: "rgba(255,79,97,1)",
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
