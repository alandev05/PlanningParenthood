import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SPACING } from "../lib/theme";
import { SunCloud } from "./Doodles";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";

const PrimaryColor = "rgba(255,79,97,1)";

export default function Header({
  title,
  subtitle,
  doodle = true,
  showBack,
}: {
  title?: string;
  subtitle?: string;
  doodle?: boolean;
  showBack?: boolean;
}) {
  const navigation = useNavigation();
  // @ts-ignore
  const canGoBack = navigation?.canGoBack?.() ?? false;
  const shouldShowBack = typeof showBack === "boolean" ? showBack : canGoBack;
  return (
    <View style={styles.header}>
      {shouldShowBack ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => {
            // @ts-ignore
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <ChevronLeft color={PrimaryColor} size={22} />
        </TouchableOpacity>
      ) : null}
      <View style={styles.textWrap}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {doodle ? <SunCloud style={styles.doodle} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl - SPACING.sm,
    backgroundColor: "#fff",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    left: SPACING.lg,
    top: SPACING.lg,
    padding: SPACING.sm,
  },
  textWrap: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: PrimaryColor,
    textAlign: "center",
  },
  subtitle: {
    marginTop: SPACING.sm - 2,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  doodle: {
    position: "absolute",
    right: SPACING.lg,
    top: SPACING.lg,
  },
});
