import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Program } from "../types";
import { SPACING } from "../lib/theme";

const Primary = "rgba(255,79,97,1)";
const Secondary = "rgba(110,186,166,1)";

export default function ProgramCard({
  program,
  onPress,
}: {
  program: Program;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{program.title}</Text>
          <Text style={styles.why} numberOfLines={2}>
            {program.why}
          </Text>
        </View>
        <View style={styles.meta}>
          {program.priceMonthly == null || program.priceMonthly === 0 ? (
            <View style={[styles.badge, styles.freeBadge]}>
              <Text style={styles.badgeText}>Free</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.priceBadge]}>
              <Text style={styles.badgeText}>${program.priceMonthly}/mo</Text>
            </View>
          )}
          <Text style={styles.distance}>{program.distanceMiles} mi</Text>
        </View>
      </View>
      <View style={styles.rowBottom}>
        <Text style={styles.age}>
          Ages {program.ageRange[0]}–{program.ageRange[1]}
        </Text>
        <Text style={styles.fit}>Why it fits</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: SPACING.md - 2,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  row: { flexDirection: "row", alignItems: "center" },
  titleWrap: { flex: 1, paddingRight: SPACING.sm },
  title: { fontSize: 16, fontWeight: "700", color: "#222" },
  why: { marginTop: SPACING.sm - 2, color: "#444", fontSize: 13 },
  meta: { alignItems: "flex-end" },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 12,
  },
  freeBadge: { backgroundColor: Secondary },
  priceBadge: { backgroundColor: Primary },
  badgeText: { color: "#fff", fontWeight: "700" },
  distance: { marginTop: SPACING.sm, color: "#666", fontSize: 12 },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.md - 4,
  },
  age: { color: "#666", fontSize: 12 },
  fit: { color: "#FF4F61", fontSize: 12, fontWeight: "700" },
});
