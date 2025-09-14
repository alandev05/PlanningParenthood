import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Header from "../components/Header";
import { fetchDemoPrograms, DEMO_ZIP } from "../lib/demoData";
import ProgramCard from "../components/ProgramCard";
import FABChat from "../components/FABChat";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { SunCloud } from "../components/Doodles";
import { searchNearbyPlaces, PlaceResult } from "../lib/googleMapsApi";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPACING } from "../lib/theme";

export default function ResultsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const params: any = route.params;
  const zip = params?.zip ?? DEMO_ZIP;
  const age = params?.age ?? 9;

  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "map">("list");
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [mapMarkers, setMapMarkers] = useState<PlaceResult[]>([]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const list = fetchDemoPrograms({
        zip,
        age,
        maxDistance: 10,
        maxBudget: 1000,
      });
      setPrograms(list);
      setLoading(false);
    }, 850);

    // Get user location for map
    getCurrentLocation();

    return () => clearTimeout(t);
  }, [zip, age]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
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
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const searchNearbyHealthcare = async (lat: number, lng: number) => {
    try {
      const places = await searchNearbyPlaces(lat, lng, "hospital", 10000);
      setMapMarkers(places);
    } catch (error) {
      console.error("Error searching places:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header
        title="Results"
        subtitle={`Showing programs near ${zip}`}
        doodle={false}
      />
      <SunCloud style={styles.cloud} />

      <View style={styles.controls}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={[styles.toggle, view === "list" && styles.toggleActive]}
            onPress={() => setView("list")}
          >
            <Text>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, view === "map" && styles.toggleActive]}
            onPress={() => setView("map")}
          >
            <Text>Map</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={styles.filterChip}>
            <Text>Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text>Distance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text>Day</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ padding: 16 }}>
          <ActivityIndicator size="large" color="rgba(255,79,97,1)" />
        </View>
      ) : view === "list" ? (
        <FlatList
          data={programs}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <ProgramCard
              program={item}
              onPress={() =>
                navigation.navigate("ProgramDetail", { id: item.id })
              }
            />
          )}
          contentContainerStyle={{ paddingBottom: SPACING.xl }}
        />
      ) : view === "list" ? (
        <FlatList
          data={programs}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <ProgramCard
              program={item}
              onPress={() =>
                navigation.navigate("ProgramDetail", { id: item.id })
              }
            />
          )}
        />
      ) : (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {/* Healthcare facility markers */}
          {mapMarkers.map((marker) => (
            <Marker
              key={marker.place_id}
              coordinate={{
                latitude: marker.geometry.location.lat,
                longitude: marker.geometry.location.lng,
              }}
              title={marker.name}
              description={marker.formatted_address}
              pinColor="red"
            />
          ))}
          
          {/* Program markers */}
          {programs.filter(p => p.latitude && p.longitude).map(program => (
            <Marker
              key={program.id}
              coordinate={{
                latitude: program.latitude!,
                longitude: program.longitude!,
              }}
              title={program.title}
              description={`$${program.priceMonthly || 0}/month - ${program.address}`}
              pinColor="blue"
              onCalloutPress={() => navigation.navigate('ProgramDetail', { id: program.id })}
            />
          ))}
        </MapView>
      )}

      <FABChat
        onPress={() => {
          /* open chat modal - placeholder */
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  cloud: { position: "absolute", right: 18, top: 18, opacity: 0.9 },
  controls: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    padding: 8,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  toggleActive: { backgroundColor: "rgba(255,79,97,0.12)" },
  filterChip: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginLeft: 8,
  },
  map: { flex: 1 },
});
