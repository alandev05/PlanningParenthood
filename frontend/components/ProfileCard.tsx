import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { ExtraordinaryPerson } from "../screens/ExtraordinaryPeopleScreen";

interface ProfileCardProps {
  profile: ExtraordinaryPerson;
  isExpanded?: boolean;
  onPress?: () => void;
  onDeepResearch?: (name: string) => void;
  showDeepResearchButton?: boolean;
}

export default function ProfileCard({
  profile,
  isExpanded = false,
  onPress,
  onDeepResearch,
  showDeepResearchButton = false,
}: ProfileCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        {profile.imageUrl ? (
          <Image
            source={{ uri: profile.imageUrl }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.title}>{profile.title}</Text>
          <Text style={styles.company}>{profile.company}</Text>
          <Text style={styles.location}>{profile.location}</Text>
        </View>
        <View style={styles.headerActions}>
          {showDeepResearchButton && (
            <TouchableOpacity
              style={styles.researchButton}
              onPress={(e) => {
                e.stopPropagation();
                onDeepResearch?.(profile.name);
              }}
            >
              <Text style={styles.researchButtonText}>🔬</Text>
            </TouchableOpacity>
          )}
          <View style={styles.expandIcon}>
            <Text style={styles.expandText}>{isExpanded ? "−" : "+"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tagsContainer}>
        {profile.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.backstoryContainer}>
        {profile.childrenSummary && (
          <Text style={styles.childrenText}>{profile.childrenSummary}</Text>
        )}
        <Text style={styles.backstoryText}>{profile.backstory}</Text>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          {profile.parentingLessons && profile.parentingLessons.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Parenting Lessons</Text>
              {profile.parentingLessons.map((lesson, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{lesson}</Text>
                </View>
              ))}
            </View>
          )}

          {profile.parentingTechniques &&
            profile.parentingTechniques.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Parenting Techniques</Text>
                {profile.parentingTechniques.map((technique, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listText}>{technique}</Text>
                  </View>
                ))}
              </View>
            )}

          {profile.familyBackground && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Family Background</Text>
              <Text style={styles.sectionText}>{profile.familyBackground}</Text>
            </View>
          )}

          {profile.inspirationalQuotes &&
            profile.inspirationalQuotes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💬 Inspirational Quotes</Text>
                {profile.inspirationalQuotes.map((quote, index) => (
                  <Text key={index} style={styles.quote}>
                    "{quote}"
                  </Text>
                ))}
              </View>
            )}

          {profile.communityImpact && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌟 Community Impact</Text>
              <Text style={styles.sectionText}>{profile.communityImpact}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Key Achievements</Text>
            {profile.achievements.map((achievement, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{achievement}</Text>
              </View>
            ))}
          </View>

          {profile.stats && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Impact Stats</Text>
              <View style={styles.statsGrid}>
                {profile.stats.founded && (
                  <Text style={styles.stat}>
                    Founded: {profile.stats.founded}
                  </Text>
                )}
                {profile.stats.employees && (
                  <Text style={styles.stat}>
                    Employees: {profile.stats.employees}
                  </Text>
                )}
                {profile.stats.charitable_giving && (
                  <Text style={styles.stat}>
                    Charitable Giving: {profile.stats.charitable_giving}
                  </Text>
                )}
                {profile.stats.books_written && (
                  <Text style={styles.stat}>
                    Books Written: {profile.stats.books_written}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  header: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: "#EEE",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF4F61",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerInfo: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  researchButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
  },
  researchButtonText: {
    fontSize: 14,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: "#666",
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: "#888",
  },
  expandIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  expandText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E8FF",
  },
  tagText: {
    fontSize: 12,
    color: "#4A90E2",
    fontWeight: "500",
  },
  backstoryContainer: {
    marginBottom: 16,
  },
  backstoryText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  childrenText: {
    fontSize: 12,
    color: "#4A90E2",
    marginBottom: 6,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: "#FF4F61",
    marginRight: 8,
    fontWeight: "bold",
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  quote: {
    fontSize: 14,
    color: "#4A90E2",
    fontStyle: "italic",
    marginBottom: 8,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#4A90E2",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  stat: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
