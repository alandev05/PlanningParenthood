import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SunCloud } from "./Doodles";
import { SPACING } from "../lib/theme";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  // @ts-ignore
  const canGoBack = navigation?.canGoBack?.() ?? false;
  const shouldShowBack = typeof showBack === "boolean" ? showBack : canGoBack;
  return (
    <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
      {shouldShowBack ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => {
            // @ts-ignore
            navigation.goBack();
          }}
          style={[styles.backBtn, { top: insets.top + SPACING.sm }]}
        >
          <ChevronLeft color={PrimaryColor} size={22} />
        </TouchableOpacity>
      ) : null}
      <View style={styles.textWrap}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {doodle ? (
        <SunCloud style={[styles.doodle, { top: insets.top + SPACING.sm }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: SPACING.lg,
    backgroundColor: "#fff",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    left: SPACING.lg,
    padding: SPACING.sm,
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: PrimaryColor,
    fontWeight: "600",
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
  },
});
