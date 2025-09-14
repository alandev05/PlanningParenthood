import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SPACING } from "../../lib/theme";
import DevelopmentDomainCard from "../../components/DevelopmentDomainCard";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

interface LocalOpportunity {
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  price_info: string;
  age_range: string;
  transportation_notes: string;
  match_reason: string;
}

interface DevelopmentDomainData {
  parenting_advice: string;
  activity_types: string[];
  local_opportunities: LocalOpportunity[];
}

interface ComprehensiveRecommendations {
  cognitive: DevelopmentDomainData;
  physical: DevelopmentDomainData;
  emotional: DevelopmentDomainData;
  social: DevelopmentDomainData;
}

export default function RecommendationsTab() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ComprehensiveRecommendations | null>(null);
  const [expandedDomains, setExpandedDomains] = useState<{
    [key: string]: boolean;
  }>({
    cognitive: false,
    physical: false,
    emotional: false,
    social: false,
  });
  const [priorityOrder, setPriorityOrder] = useState<string[] | null>(null);

  useEffect(() => {
    loadRecommendations();
    loadPriorities();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      console.log("🔍 Loading comprehensive recommendations...");
      
      // Get comprehensive recommendations from AsyncStorage
      const storedRecommendations = await AsyncStorage.getItem("latest_recommendations");
      
      if (storedRecommendations) {
        const parsedRecommendations = JSON.parse(storedRecommendations);
        console.log("📊 Parsed recommendations:", parsedRecommendations);
        
        // Check if it's the new comprehensive format
        if (parsedRecommendations && 
            typeof parsedRecommendations === 'object' &&
            parsedRecommendations.cognitive &&
            parsedRecommendations.physical &&
            parsedRecommendations.emotional &&
            parsedRecommendations.social) {
          
          console.log("✅ Found comprehensive recommendations format");
          setRecommendations(parsedRecommendations);
        } else if (Array.isArray(parsedRecommendations)) {
          console.log("⚠️ Found old format (array), converting...");
          const convertedRecommendations = convertOldFormatToNew(parsedRecommendations);
          setRecommendations(convertedRecommendations);
        } else {
          console.warn("⚠️ Unknown recommendations format; showing empty state");
          setRecommendations(null);
        }
      } else {
        console.log("❌ No recommendations found in storage");
        // Set empty state - user needs to complete intake quiz
      }
    } catch (error) {
      console.error("❌ Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPriorities = async () => {
    try {
      const saved = await AsyncStorage.getItem("latest_priorities_ranked");
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length) {
          setPriorityOrder(arr);
        }
      }
    } catch {}
  };

  const convertOldFormatToNew = (oldRecommendations: any): ComprehensiveRecommendations => {
    // Convert old array format to new comprehensive format
    const domains = ['cognitive', 'physical', 'emotional', 'social'];
    const converted: ComprehensiveRecommendations = {
      cognitive: {
        parenting_advice: "Focus on age-appropriate learning activities that match your child's interests and development stage.",
        activity_types: ["Educational games", "Reading activities", "STEM exploration"],
        local_opportunities: []
      },
      physical: {
        parenting_advice: "Encourage regular physical activity appropriate for your child's age and energy level.",
        activity_types: ["Outdoor play", "Sports activities", "Movement games"],
        local_opportunities: []
      },
      emotional: {
        parenting_advice: "Create a supportive environment for emotional expression and regulation.",
        activity_types: ["Art activities", "Mindfulness exercises", "Emotional check-ins"],
        local_opportunities: []
      },
      social: {
        parenting_advice: "Provide opportunities for social interaction and relationship building.",
        activity_types: ["Group activities", "Play dates", "Community events"],
        local_opportunities: []
      }
    };

    // Map old recommendations to new format (guard non-array)
    const list = Array.isArray(oldRecommendations) ? oldRecommendations : [];
    list.forEach((rec, index) => {
      const domain = domains[index % domains.length] as keyof ComprehensiveRecommendations;
      if (converted[domain]) {
        converted[domain].local_opportunities.push({
          name: rec.title || "Activity",
          description: rec.description || "A great activity for your child",
          address: rec.address || "Check local area",
          phone: rec.phone || "Contact for details",
          website: rec.website || "",
          price_info: rec.price_monthly ? `$${rec.price_monthly}/month` : "Free",
          age_range: `${rec.age_min || 3}-${rec.age_max || 12} years`,
          transportation_notes: "Accessible by your transportation method",
          match_reason: rec.ai_explanation || "This activity matches your child's needs"
        });
      }
    });

    return converted;
  };

  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev => ({
      ...prev,
      [domain]: !prev[domain]
    }));
  };

  const expandAllDomains = () => {
    setExpandedDomains({
      cognitive: true,
      physical: true,
      emotional: true,
      social: true,
    });
  };

  const collapseAllDomains = () => {
    setExpandedDomains({
      cognitive: false,
      physical: false,
      emotional: false,
      social: false,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4F61" />
          <Text style={styles.loadingText}>Loading your plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recommendations) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Parent Plan</Text>
          <Text style={styles.subtitle}>
            Personalized recommendations based on your child's profile
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Plan Available</Text>
          <Text style={styles.emptyText}>
            Complete the intake quiz to get personalized insights and recommendations for your child.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate("Intake")}
          >
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Parent Plan</Text>
        <Text style={styles.subtitle}>
          Personalized recommendations based on your child's profile
        </Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success banner removed to reduce clutter */}

        {/* Control Buttons */}
        <View style={styles.controlButtons}>
          <Text 
            style={styles.controlButton} 
            onPress={expandAllDomains}
          >
            Expand All
          </Text>
          <Text 
            style={styles.controlButton} 
            onPress={collapseAllDomains}
          >
            Collapse All
          </Text>
        </View>

        {/* Development Domain Cards (ordered by user priorities if available) */}
        <View style={styles.domainsContainer}>
          {(() => {
            const defaultOrder: Array<keyof ComprehensiveRecommendations> = [
              'cognitive', 'physical', 'emotional', 'social'
            ];
            const mapLabelToKey: Record<string, keyof ComprehensiveRecommendations> = {
              Cognitive: 'cognitive',
              Physical: 'physical',
              Emotional: 'emotional',
              Social: 'social',
            };
            const order: Array<keyof ComprehensiveRecommendations> = priorityOrder && priorityOrder.length
              ? priorityOrder.map(label => mapLabelToKey[label] || 'cognitive').filter(Boolean) as Array<keyof ComprehensiveRecommendations>
              : defaultOrder;
            const uniqueOrder = Array.from(new Set([...order, ...defaultOrder]));
            return uniqueOrder.map((domainKey) => (
              <DevelopmentDomainCard
                key={domainKey}
                domain={domainKey as any}
                data={recommendations[domainKey]}
                isExpanded={expandedDomains[domainKey]}
                onToggle={() => toggleDomain(domainKey)}
              />
            ));
          })()}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Tip: Tap on any domain to see detailed recommendations, 
            parenting advice, and local opportunities tailored to your child.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(255,79,97,1)",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  startButton: {
    backgroundColor: "#FF4F61",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  successCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  successText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: SPACING.md,
  },
  controlButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF4F61",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  domainsContainer: {
    marginBottom: SPACING.lg,
  },
  footer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  footerText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
});