import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPACING } from "../../lib/theme";

export default function StoriesTab() {
  const stories = [
    {
      id: "1",
      title: "From Shy to Social Butterfly",
      family: "The Johnson Family",
      childAge: 5,
      category: "social",
      preview:
        "How weekly library story time transformed Emma from a shy child into a confident communicator...",
      outcome: "Emma now initiates conversations and has made 3 close friends",
    },
    {
      id: "2",
      title: "Building Confidence Through Movement",
      family: "The Martinez Family",
      childAge: 7,
      category: "physical",
      preview:
        "Soccer practice seemed impossible for anxious Carlos, but with the right approach...",
      outcome: "Carlos became team captain and gained confidence in all areas",
    },
    {
      id: "3",
      title: "Nurturing a Young Scientist",
      family: "The Chen Family",
      childAge: 6,
      category: "cognitive",
      preview:
        "Simple kitchen experiments sparked Lily's love for learning and discovery...",
      outcome: "Lily now asks 'why' about everything and loves problem-solving",
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      physical: "#4CAF50",
      cognitive: "#2196F3",
      emotional: "#FF9800",
      social: "#9C27B0",
    };
    return colors[category as keyof typeof colors] || "#666";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Success Stories</Text>
          <Text style={styles.subtitle}>
            Real families, real results from our AI recommendations
          </Text>
        </View>

        {null}

        {/* Preview of what stories will look like */}
        <View style={styles.previewSection}>
          {stories.map((story) => (
            <View key={story.id} style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <View style={styles.storyMeta}>
                  <Text style={styles.storyFamily}>{story.family}</Text>
                  <View style={styles.storyTags}>
                    <View
                      style={[
                        styles.categoryTag,
                        { backgroundColor: getCategoryColor(story.category) },
                      ]}
                    >
                      <Text style={styles.categoryText}>
                        {story.category.charAt(0).toUpperCase() +
                          story.category.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.ageTag}>Age {story.childAge}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyPreview}>{story.preview}</Text>

              <View style={styles.outcomeContainer}>
                <Text style={styles.outcomeLabel}>Outcome:</Text>
                <Text style={styles.outcomeText}>{story.outcome}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Have a success story to share? We'd love to hear from you!
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
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "rgba(255,79,97,1)",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  comingSoon: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: "rgba(110,186,166,0.1)",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "rgba(110,186,166,1)",
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
  previewSection: {
    padding: SPACING.lg,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.lg,
  },
  storyCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  storyHeader: {
    marginBottom: SPACING.md,
  },
  storyMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storyFamily: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  storyTags: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: SPACING.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  ageTag: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.sm,
  },
  storyPreview: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  outcomeContainer: {
    backgroundColor: "#FFFFFF",
    padding: SPACING.md,
    borderRadius: 8,
  },
  outcomeLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.xs,
  },
  outcomeText: {
    fontSize: 14,
    color: "#666",
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
  },
});
