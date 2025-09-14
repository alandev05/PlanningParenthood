import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Header from "../components/Header";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { SunCloud } from "../components/Doodles";
import { SPACING } from "../lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header
        title="Parenting, planned."
        subtitle="Discover local opportunities for your child. No account needed."
        doodle={false}
        showBack={false}
      />
      <SunCloud style={styles.sun} />

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.primary}
          onPress={() => navigation.navigate("Intake")}
        >
          <Text style={styles.primaryText}>Plan my child's path</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondary}
          onPress={() => navigation.navigate("Results", { demo: true })}
        >
          <Text style={styles.secondaryText}>Skip Quiz</Text>
        </TouchableOpacity>

        {/* Extraordinary People moved into tab navigator */}

        <TouchableOpacity
          style={styles.ghost}
          onPress={() => {
            /* privacy - placeholder */
          }}
        >
          <Text style={styles.ghostText}>Privacy</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  sun: {
    position: "absolute",
    right: SPACING.xl - SPACING.sm,
    top: SPACING.md - 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl - SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  primary: {
    backgroundColor: "rgba(255,79,97,1)",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl + SPACING.sm,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.md - 4,
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  secondary: {
    borderColor: "#eee",
    borderWidth: 1,
    paddingVertical: SPACING.md - 2,
    paddingHorizontal: SPACING.lg + SPACING.sm,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.xl - SPACING.sm,
  },
  secondaryText: { color: "#333", fontWeight: "700" },
  ghost: { marginTop: SPACING.sm },
  ghostText: { color: "#666" },
  extraordinaryButton: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  extraordinaryButtonText: {
    color: "#1976D2",
    fontWeight: "700",
    fontSize: 15,
  },
});
