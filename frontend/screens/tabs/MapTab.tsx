import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { SPACING } from "../../lib/theme";

// Conditional import for react-native-maps (not available on web)
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
}

interface Recommendation {
  activity_id: string;
  title: string;
  category: string;
  latitude?: number;
  longitude?: number;
}

export default function MapTab() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [region, setRegion] = useState({
    latitude: 42.3601,
    longitude: -71.0589,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadRecommendations();
    getCurrentLocation();
  }, []);

  const loadRecommendations = async () => {
    try {
      const storedRecommendations = await AsyncStorage.getItem("latest_recommendations");
      
      if (storedRecommendations) {
        const parsed = JSON.parse(storedRecommendations);
        if (Array.isArray(parsed)) {
          setRecommendations(parsed);
        } else if (parsed && typeof parsed === 'object') {
          // Flatten comprehensive schema into a list of map-friendly items
          const flatten = (domainKey: string, domain: any) =>
            (domain?.local_opportunities || []).map((op: any, idx: number) => ({
              activity_id: `${domainKey}_${idx}_${op.name}`,
              title: op.name,
              category: domainKey,
              latitude: op.latitude, // optional if present
              longitude: op.longitude, // optional if present
            }));
          const flat = [
            ...flatten('cognitive', parsed.cognitive),
            ...flatten('physical', parsed.physical),
            ...flatten('emotional', parsed.emotional),
            ...flatten('social', parsed.social),
          ];
          setRecommendations(flat);
        }
      }
    } catch (error) {
      console.error("Error loading recommendations for map:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      physical: "#4CAF50",
      cognitive: "#2196F3", 
      emotional: "#FF9800",
      social: "#9C27B0",
    };
    return colors[category as keyof typeof colors] || "#666";
  };

  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webContainer}>
          <Text style={styles.webTitle}>Map View</Text>
          <Text style={styles.webText}>
            Map functionality is not available on web. Please use the mobile app to view activity locations.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="rgba(255,79,97,1)" />
          <Text style={styles.loadingText}>Loading activity locations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Locations</Text>
        <Text style={styles.subtitle}>
          {recommendations.length} activities near you
        </Text>
      </View>

      <View style={styles.mapContainer}>
        {MapView && (
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            {recommendations.map((rec, index) => (
              <Marker
                key={rec.activity_id}
                coordinate={{
                  latitude: rec.latitude || (region.latitude + (Math.random() - 0.5) * 0.01),
                  longitude: rec.longitude || (region.longitude + (Math.random() - 0.5) * 0.01),
                }}
                title={rec.title}
                description={`${rec.category.charAt(0).toUpperCase() + rec.category.slice(1)} Development`}
                pinColor={getCategoryColor(rec.category)}
              />
            ))}
          </MapView>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Categories</Text>
        <View style={styles.legendItems}>
          {["physical", "cognitive", "emotional", "social"].map((category) => (
            <View key={category} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendDot, 
                  { backgroundColor: getCategoryColor(category) }
                ]} 
              />
              <Text style={styles.legendText}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    color: "#666",
    fontSize: 16,
  },
  webContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  webTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#333",
    marginBottom: SPACING.md,
  },
  webText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
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
  mapContainer: {
    flex: 1,
    margin: SPACING.lg,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  legend: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: SPACING.sm,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: 14,
    color: "#666",
  },
});