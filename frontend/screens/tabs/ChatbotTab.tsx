import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPACING } from "../../lib/theme";

export default function ChatbotTab() {
  const suggestedQuestions = [
    "How can I help my 5-year-old develop better social skills?",
    "What are some budget-friendly physical activities for my child?",
    "How do I know if my child is meeting cognitive milestones?",
    "My child is shy - how can I help them build confidence?",
    "What activities work best for hands-on parenting style?",
    "How can I balance screen time with developmental activities?",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Parenting Assistant</Text>
          <Text style={styles.subtitle}>
            Get personalized advice about your child's development
          </Text>
        </View>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonTitle}>🤖 AI Chat Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            We're building an intelligent chatbot that will provide personalized parenting advice based on your family profile and recommendations. 
            It will help answer questions about child development, activity suggestions, and parenting strategies.
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What the AI Assistant Will Do:</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💡</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Personalized Advice</Text>
                <Text style={styles.featureDescription}>
                  Get advice tailored to your child's age, personality, and your parenting style
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Activity Recommendations</Text>
                <Text style={styles.featureDescription}>
                  Ask about specific activities and get detailed guidance on implementation
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📈</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Development Tracking</Text>
                <Text style={styles.featureDescription}>
                  Understand milestones and get suggestions for supporting growth
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤝</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Parenting Support</Text>
                <Text style={styles.featureDescription}>
                  Get encouragement and practical tips for common parenting challenges
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.questionsSection}>
          <Text style={styles.questionsTitle}>Questions You'll Be Able to Ask:</Text>
          
          {suggestedQuestions.map((question, index) => (
            <TouchableOpacity key={index} style={styles.questionCard}>
              <Text style={styles.questionText}>"{question}"</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            The AI assistant will have full context of your family profile and current recommendations to provide the most relevant advice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
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
  comingSoon: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: "rgba(33,150,243,0.1)",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "rgba(33,150,243,1)",
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.sm,
  },
  comingSoonText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  featuresSection: {
    padding: SPACING.lg,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.lg,
  },
  featuresList: {
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  featureIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  questionsSection: {
    padding: SPACING.lg,
  },
  questionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.lg,
  },
  questionCard: {
    backgroundColor: "#F8F9FA",
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(33,150,243,1)",
  },
  questionText: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
  },
  footer: {
    padding: SPACING.lg,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});