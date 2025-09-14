import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { SPACING } from "../../lib/theme";

export default function SettingsTab() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleRetakeQuiz = () => {
    Alert.alert(
      "Retake Quiz",
      "This will clear your current recommendations and take you back to the intake form. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            // Clear stored data and navigate to intake
            AsyncStorage.multiRemove(["latest_recommendations", "current_family_id"]);
            navigation.navigate("Intake");
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your family data and recommendations. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Success", "All data has been cleared.");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data. Please try again.");
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    onPress, 
    destructive = false 
  }: {
    title: string;
    subtitle: string;
    onPress: () => void;
    destructive?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
          {title}
        </Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.settingArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Manage your family profile and app preferences
          </Text>
        </View>

        {/* Family Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Profile</Text>
          
          <SettingItem
            title="Retake Intake Quiz"
            subtitle="Update your family information and get new recommendations"
            onPress={handleRetakeQuiz}
          />
          
          <SettingItem
            title="Kid Quiz"
            subtitle="Retake the personality assessment for your child"
            onPress={() => navigation.navigate("KidQuiz")}
          />
        </View>

        {/* Recommendations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          
          <SettingItem
            title="Refresh Recommendations"
            subtitle="Generate new AI-powered recommendations with current data"
            onPress={() => {
              Alert.alert("Info", "Navigate back to intake to generate fresh recommendations.");
            }}
          />
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          
          <SettingItem
            title="About Planning Parenthood"
            subtitle="Learn more about our AI-powered parenting recommendations"
            onPress={() => {
              Alert.alert(
                "About Planning Parenthood",
                "Planning Parenthood uses AI to provide personalized parenting recommendations across four key development areas: Physical, Cognitive, Emotional, and Social development."
              );
            }}
          />
          
          <SettingItem
            title="Privacy & Data"
            subtitle="Your data is stored locally and used only for recommendations"
            onPress={() => {
              Alert.alert(
                "Privacy & Data",
                "Your family data is stored locally on your device and is used only to generate personalized recommendations. We do not share your personal information with third parties."
              );
            }}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <SettingItem
            title="Clear All Data"
            subtitle="Permanently delete all family data and recommendations"
            onPress={handleClearData}
            destructive={true}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Planning Parenthood v1.0.0
          </Text>
          <Text style={styles.footerText}>
            Powered by AI for personalized parenting
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
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: SPACING.xs,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  settingArrow: {
    fontSize: 20,
    color: "#CCC",
    fontWeight: "300",
  },
  destructiveText: {
    color: "#FF3B30",
  },
  footer: {
    padding: SPACING.lg,
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: 14,
    color: "#999",
    marginBottom: SPACING.xs,
  },
});