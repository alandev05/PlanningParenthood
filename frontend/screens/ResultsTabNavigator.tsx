import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";

// Tab screens
import RecommendationsTab from "./tabs/RecommendationsTab";
import MapTab from "./tabs/MapTab";
import StoriesTab from "./tabs/StoriesTab";
import ChatbotTab from "./tabs/ChatbotTab";
import SettingsTab from "./tabs/SettingsTab";

// Icons (using simple text for now, can be replaced with icon library)
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons = {
    Recommendations: focused ? "📋" : "📄",
    Map: focused ? "🗺️" : "🗺️",
    Stories: focused ? "📚" : "📖",
    Chat: focused ? "🤖" : "💬",
    Settings: focused ? "⚙️" : "⚙️",
  };
  
  return icons[name as keyof typeof icons] || "•";
};

const Tab = createBottomTabNavigator();

export default function ResultsTabNavigator() {
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
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          height: Platform.OS === "ios" ? 85 : 65,
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
          tabBarLabel: "For You",
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
        name="Chat" 
        component={ChatbotTab}
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