import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity, Platform } from "react-native";
// Conditional import for react-native-maps (not available on web)
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}
import * as Location from "expo-location";
import { searchNearbyPlaces, PlaceResult } from "../lib/googleMapsApi";

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const MapScreen = () => {
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [markers, setMarkers] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required to show nearby facilities"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
      searchNearbyHealthcare(
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const searchNearbyHealthcare = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const places = await searchNearbyPlaces(lat, lng, "hospital", 10000);
      setMarkers(places);
    } catch (error) {
      console.error("Error searching places:", error);
      Alert.alert("Error", "Failed to load nearby healthcare facilities");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' && MapView ? (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.place_id}
              coordinate={{
                latitude: marker.geometry.location.lat,
                longitude: marker.geometry.location.lng,
              }}
              title={marker.name}
              description={marker.formatted_address || marker.vicinity}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.map}>
          <Text style={styles.mapPlaceholder}>Map view not available on web</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() =>
          searchNearbyHealthcare(region.latitude, region.longitude)
        }
        disabled={loading}
      >
        <Text style={styles.refreshText}>
          {loading ? "Loading..." : "Find Healthcare Nearby"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#666',
  },
  refreshButton: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  refreshText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MapScreen;
