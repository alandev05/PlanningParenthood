import React from "react";
import { useRoute } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Tab screens
import RecommendationsTab from "./tabs/RecommendationsTab";
import MapTab from "./tabs/MapTab";
import StoriesTab from "./tabs/StoriesTab";
import ChatbotTab from "./tabs/ChatbotTab";
import SettingsTab from "./tabs/SettingsTab";
import ExtraordinaryPeopleScreen from "./ExtraordinaryPeopleScreen";

// Icons (using simple text for now, can be replaced with icon library)
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Recommendations: focused ? "📋" : "📄",
    Map: focused ? "🗺️" : "🗺️",
    Stories: focused ? "📚" : "📖",
    Chat: focused ? "🤖" : "💬",
    Settings: focused ? "⚙️" : "⚙️",
  };

  const icon = icons[name] || "•";
  return <Text style={{ fontSize: 16 }}>{icon}</Text>;
};

const Tab = createBottomTabNavigator();

export default function ResultsTabNavigator() {
  const route = useRoute<any>();
  const ageFromParams: number | undefined = route?.params?.age;
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: "rgba(255,79,97,1)",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          paddingTop: 8,
          // Add consistent safe-area aware spacing at the bottom
          paddingBottom:
            Platform.OS === "ios" ? Math.max(10, insets.bottom + 10) : 10,
          // Comfortable side padding so icons aren't flush to the screen edges
          paddingLeft: Math.max(12, insets.left + 8),
          paddingRight: Math.max(12, insets.right + 8),
          height:
            (Platform.OS === "ios" ? 55 : 52) + Math.max(0, insets.bottom),
        },
        tabBarItemStyle: {
          marginHorizontal: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      })}
      initialRouteName="Recommendations"
    >
      <Tab.Screen
        name="Recommendations"
        component={RecommendationsTab}
        options={{
          tabBarLabel: "Insights",
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapTab}
        options={{
          tabBarLabel: "Map",
        }}
      />
      <Tab.Screen
        name="Stories"
        component={StoriesTab}
        options={{
          tabBarLabel: "Stories",
        }}
      />
      <Tab.Screen
        name="Extraordinary"
        component={ExtraordinaryPeopleScreen}
        options={{
          tabBarLabel: "Inspire",
        }}
      />
      <Tab.Screen
        name="Chat"
        children={() => <ChatbotTab initialAge={ageFromParams} />}
        options={{
          tabBarLabel: "AI Chat",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsTab}
        options={{
          tabBarLabel: "Settings",
        }}
      />
    </Tab.Navigator>
  );
}
