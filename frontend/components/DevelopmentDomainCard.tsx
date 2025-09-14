import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { SPACING } from "../lib/theme";

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

interface DevelopmentDomainCardProps {
  domain: "cognitive" | "physical" | "emotional" | "social";
  data: DevelopmentDomainData;
  isExpanded: boolean;
  onToggle: () => void;
}

const DOMAIN_CONFIG = {
  cognitive: {
    title: "Cognitive Development",
    icon: "🧠",
    color: "#4A90E2",
    backgroundColor: "rgba(74, 144, 226, 0.1)",
  },
  physical: {
    title: "Physical Development", 
    icon: "🏃‍♂️",
    color: "#7ED321",
    backgroundColor: "rgba(126, 211, 33, 0.1)",
  },
  emotional: {
    title: "Emotional Development",
    icon: "❤️",
    color: "#F5A623",
    backgroundColor: "rgba(245, 166, 35, 0.1)",
  },
  social: {
    title: "Social Development",
    icon: "👥",
    color: "#BD10E0",
    backgroundColor: "rgba(189, 16, 224, 0.1)",
  },
};

export default function DevelopmentDomainCard({
  domain,
  data,
  isExpanded,
  onToggle,
}: DevelopmentDomainCardProps) {
  const config = DOMAIN_CONFIG[domain];

  const handleCall = (phone: string) => {
    if (phone && phone !== "No phone needed" && phone !== "Contact for details") {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWebsite = (website: string) => {
    if (website && website.trim() !== "") {
      Linking.openURL(website);
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: config.color }]}> 
      <TouchableOpacity
        style={[styles.header, { backgroundColor: config.backgroundColor }]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={styles.icon}>{config.icon}</Text>
          <Text style={[styles.title, { color: config.color }]}>
            {config.title}
          </Text>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? "−" : "+"}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Parenting Advice Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parenting Advice</Text>
            <Text style={styles.adviceText}>{data.parenting_advice}</Text>
          </View>

          {/* Activity Types Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Types to Focus On</Text>
            {data.activity_types.map((activity, index) => (
              <View key={index} style={styles.activityTypeItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.activityTypeText}>{activity}</Text>
              </View>
            ))}
          </View>

          {/* Local Opportunities Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Local Opportunities</Text>
            {data.local_opportunities.map((opportunity, index) => (
              <View key={index} style={styles.opportunityCard}>
                <Text style={styles.opportunityName}>{opportunity.name}</Text>
                <Text style={styles.opportunityDescription}>
                  {opportunity.description}
                </Text>

                <View style={styles.opportunityDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 Address:</Text>
                    <Text style={styles.detailValue}>{opportunity.address}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💰 Cost:</Text>
                    <Text style={styles.detailValue}>{opportunity.price_info}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>👶 Ages:</Text>
                    <Text style={styles.detailValue}>{opportunity.age_range}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🚗 Getting There:</Text>
                    <Text style={styles.detailValue}>
                      {opportunity.transportation_notes}
                    </Text>
                  </View>
                </View>

                <Text style={styles.matchReason}>
                  <Text style={styles.matchReasonLabel}>Why this fits:</Text>{" "}
                  {opportunity.match_reason}
                </Text>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {opportunity.phone &&
                    opportunity.phone !== "No phone needed" &&
                    opportunity.phone !== "Contact for details" && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.callButton]}
                        onPress={() => handleCall(opportunity.phone)}
                      >
                        <Text style={styles.actionButtonText}>📞 Call</Text>
                      </TouchableOpacity>
                    )}

                  {opportunity.website && opportunity.website.trim() !== "" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.websiteButton]}
                      onPress={() => handleWebsite(opportunity.website)}
                    >
                      <Text style={styles.actionButtonText}>🌐 Website</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: "600",
    color: "#666",
  },
  content: {
    maxHeight: 400,
  },
  section: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.sm,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
  },
  activityTypeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  bulletPoint: {
    fontSize: 16,
    color: "#666",
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  activityTypeText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    lineHeight: 18,
  },
  opportunityCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  opportunityName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.xs,
  },
  opportunityDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  opportunityDetails: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    color: "#555",
    flex: 1,
  },
  matchReason: {
    fontSize: 13,
    color: "#555",
    fontStyle: "italic",
    marginBottom: SPACING.sm,
  },
  matchReasonLabel: {
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  actionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  callButton: {
    backgroundColor: "#4CAF50",
  },
  websiteButton: {
    backgroundColor: "#2196F3",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
