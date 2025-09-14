import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { SPACING } from "../../lib/theme";
import { geocodeAddress } from "../../lib/googleMapsApi";

// ---- Safe import for react-native-maps across versions/builds ----
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== "web") {
  // Some builds expose default; some don't. Marker may be named or under MapView.
  // @ts-ignore
  const RNMaps = require("react-native-maps");
  MapView = RNMaps?.default || RNMaps; // default export or module itself
  Marker = RNMaps?.Marker || (MapView && MapView.Marker) || null;
}

type LatLng = { lat: number; lng: number };

interface Recommendation {
  activity_id: string;
  title: string;
  category: string;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
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

  const geocodeCacheRef = useRef<Map<string, LatLng>>(new Map());
  const mapRef = useRef<any>(null);

  // ---------- Utils ----------
  const normalizeCoords = (items: Recommendation[]) =>
    items.map((it) => ({
      ...it,
      latitude:
        typeof it.latitude === "string" ? parseFloat(it.latitude) : it.latitude,
      longitude:
        typeof it.longitude === "string" ? parseFloat(it.longitude) : it.longitude,
    }));

  const pinsFrom = (items: Recommendation[]) =>
    normalizeCoords(items).filter(
      (r) =>
        Number.isFinite(r.latitude as number) &&
        Number.isFinite(r.longitude as number)
    );

  const computeRegionForMarkers = useCallback((items: Recommendation[]) => {
    const pins = pinsFrom(items);
    if (pins.length === 0) return null;

    let minLat = pins[0].latitude as number;
    let maxLat = pins[0].latitude as number;
    let minLng = pins[0].longitude as number;
    let maxLng = pins[0].longitude as number;

    for (const p of pins) {
      const lat = p.latitude as number;
      const lng = p.longitude as number;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const latDelta = Math.max(0.02, (maxLat - minLat) * 1.5 || 0.05);
    const lngDelta = Math.max(0.02, (maxLng - minLng) * 1.5 || 0.05);
    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, []);

  const fitToAllPins = useCallback(
    (items: Recommendation[]) => {
      if (!mapRef.current) return;
      const coords = pinsFrom(items).map((r) => ({
        latitude: r.latitude as number,
        longitude: r.longitude as number,
      }));
      if (coords.length === 0) return;

      requestAnimationFrame(() => {
        try {
          mapRef.current?.fitToCoordinates(coords, {
            edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
            animated: true,
          });
        } catch (e) {
          const fallback = computeRegionForMarkers(items);
          if (fallback) setRegion(fallback);
        }
      });
    },
    [computeRegionForMarkers]
  );

  // Addresses sometimes arrive broken; produce a safer query
  const queryFrom = (item: Recommendation) => {
    const addr = (item.address || "").trim();
    const looksBroken =
      !addr || addr.length < 6 || /^[,]|^[A-Za-z]?$/.test(addr) || addr === "on, MA 02210";
    // If the address is sketchy, try title + locality hint you know (tweak as needed)
    if (looksBroken) {
      // If you know the user's city/state, bake it in here:
      return `${item.title}, Massachusetts, USA`;
    }
    return addr;
  };

  // ---------- Effects ----------
  useEffect(() => {
    (async () => {
      await loadRecommendations();
      await getCurrentLocation(); // best-effort; map renders even if denied
      setLoading(false);
    })();
  }, []);

  // Re-fit when recommendations update (after normalization)
  useEffect(() => {
    const pins = pinsFrom(recommendations);
    console.log("🗺️ Map: pins", {
      total: recommendations.length,
      pins: pins.length,
      sample: pins.slice(0, 3),
    });
    if (pins.length > 0) fitToAllPins(recommendations);
  }, [recommendations, fitToAllPins]);

  // ---------- Data load + geocoding ----------
  const loadRecommendations = async () => {
    try {
      const stored = await AsyncStorage.getItem("latest_recommendations");
      if (!stored) {
        setRecommendations([]);
        return;
      }
      const parsed = JSON.parse(stored);

      const enrichItems = async (items: Recommendation[]) => {
        const enriched = await Promise.all(
          items.map(async (item) => {
            const hasValid =
              Number.isFinite(item.latitude as number) &&
              Number.isFinite(item.longitude as number);
            const query = queryFrom(item);

            if (hasValid || !query) return item;

            try {
              const cacheKey = query.toLowerCase();
              const cached = geocodeCacheRef.current.get(cacheKey);
              if (cached) {
                return { ...item, latitude: cached.lat, longitude: cached.lng };
              }

              const results = await geocodeAddress(query, {
                country: "US",
                locationBias: {
                  lat: region.latitude,
                  lng: region.longitude,
                  radiusMeters: 50000,
                },
              });

              // Log meta/status to see WHY something fails
              console.log("geocode:", query, results?.[0]?._meta);

              const r0 = results?.[0];
              const loc = r0?.geometry?.location;
              if (loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
                geocodeCacheRef.current.set(cacheKey, { lat: loc.lat, lng: loc.lng });
                return { ...item, latitude: loc.lat, longitude: loc.lng };
              }
              console.log("🗺️ Map: geocode no geometry for", query, { results });
            } catch (e) {
              console.log("🗺️ Map: geocode error", e);
            }
            return item;
          })
        );
        return normalizeCoords(enriched);
      };

      if (Array.isArray(parsed)) {
        // Legacy array
        const flatLegacy: Recommendation[] = parsed.map((rec: any, idx: number) => ({
          activity_id:
            rec.activity_id || `legacy_${idx}_${rec.title || rec.name || "opportunity"}`,
          title: rec.title || rec.name || "Opportunity",
          category: (rec.category || "opportunity").toString().toLowerCase(),
          address: rec.address || rec.location || "",
          latitude: rec.latitude,
          longitude: rec.longitude,
        }));
        const enrichedLegacy = await enrichItems(flatLegacy);
        setRecommendations(enrichedLegacy);
        const fit = computeRegionForMarkers(enrichedLegacy);
        if (fit) setRegion(fit);
      } else if (parsed && typeof parsed === "object") {
        // Comprehensive schema
        const flatten = (domainKey: string, domain: any) =>
          (domain?.local_opportunities || []).map((op: any, idx: number) => ({
            activity_id: `${domainKey}_${idx}_${op.name}`,
            title: op.name,
            category: domainKey,
            address: op.address,
            latitude: op.latitude,
            longitude: op.longitude,
          }));
        const flat: Recommendation[] = [
          ...flatten("cognitive", parsed.cognitive),
          ...flatten("physical", parsed.physical),
          ...flatten("emotional", parsed.emotional),
          ...flatten("social", parsed.social),
        ];
        const enriched = await enrichItems(flat);
        setRecommendations(enriched);
        const fit = computeRegionForMarkers(enriched);
        if (fit) setRegion(fit);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error loading recommendations for map:", error);
      Alert.alert("Map", "Failed to load activity locations.");
      setRecommendations([]);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion((prev) => ({
          ...prev,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));
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
    } as const;
    return (colors as any)[category] || "#666";
  };

  // ---------- Render ----------
  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webContainer}>
          <Text style={styles.webTitle}>Map View</Text>
          <Text style={styles.webText}>
            Map functionality isn’t available on web in this build. Please use the mobile app.
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

  const visiblePins = pinsFrom(recommendations);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Locations</Text>
        <Text style={styles.subtitle}>{visiblePins.length} activities near you</Text>
      </View>

      <View style={styles.mapContainer}>
        {MapView && Marker ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onMapReady={() => fitToAllPins(recommendations)}
            onRegionChangeComplete={setRegion}
          >
            {visiblePins.map((rec) => (
              <Marker
                key={rec.activity_id}
                coordinate={{
                  latitude: rec.latitude as number,
                  longitude: rec.longitude as number,
                }}
                title={rec.title}
                description={`${rec.category.charAt(0).toUpperCase() + rec.category.slice(1)} Development`}
                pinColor={getCategoryColor(rec.category)}
              />
            ))}
          </MapView>
        ) : (
          <View style={[styles.loadingContainer, { padding: SPACING.lg }]}>
            <Text>Maps unavailable on this platform or Marker export missing.</Text>
          </View>
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
                  { backgroundColor: getCategoryColor(category) },
                ]}
              />
              <Text style={styles.legendText}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {visiblePins.length === 0 && (
        <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg }}>
          <Text style={{ color: "#888" }}>
            No mappable addresses yet. Check API key/quotas or refresh recommendations.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: SPACING.md, color: "#666", fontSize: 16 },
  webContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: SPACING.lg },
  webTitle: { fontSize: 24, fontWeight: "800", color: "#333", marginBottom: SPACING.md },
  webText: { fontSize: 16, color: "#666", textAlign: "center", lineHeight: 24 },
  header: { padding: SPACING.lg, paddingBottom: SPACING.md },
  title: { fontSize: 24, fontWeight: "800", color: "#333", marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, color: "#666" },
  mapContainer: { flex: 1, margin: SPACING.lg, borderRadius: 12, overflow: "hidden" },
  map: { flex: 1 },
  legend: { padding: SPACING.lg, paddingTop: SPACING.md },
  legendTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: SPACING.sm },
  legendItems: { flexDirection: "row", flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", marginRight: SPACING.lg, marginBottom: SPACING.xs },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: SPACING.xs },
  legendText: { fontSize: 14, color: "#666" },
});




// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   Platform,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Location from "expo-location";
// import { SPACING } from "../../lib/theme";
// import { geocodeAddress } from "../../lib/googleMapsApi";

// // Conditional import for react-native-maps (not available on web)
// let MapView: any = null;
// let Marker: any = null;

// if (Platform.OS !== "web") {
//   const Maps = require("react-native-maps");
//   MapView = Maps.default;
//   Marker = Maps.Marker;
// }

// interface Recommendation {
//   activity_id: string;
//   title: string;
//   category: string;
//   address?: string;
//   latitude?: number;
//   longitude?: number;
// }

// export default function MapTab() {
//   const [loading, setLoading] = useState(true);
//   const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
//   const geocodeCacheRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());
//   const [region, setRegion] = useState({
//     latitude: 42.3601,
//     longitude: -71.0589,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   });

//   const computeRegionForMarkers = (items: Recommendation[]) => {
//     const pins = items.filter(
//       (r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude)
//     );
//     if (pins.length === 0) return null;
//     let minLat = pins[0].latitude as number;
//     let maxLat = pins[0].latitude as number;
//     let minLng = pins[0].longitude as number;
//     let maxLng = pins[0].longitude as number;
//     for (const p of pins) {
//       const lat = p.latitude as number;
//       const lng = p.longitude as number;
//       if (lat < minLat) minLat = lat;
//       if (lat > maxLat) maxLat = lat;
//       if (lng < minLng) minLng = lng;
//       if (lng > maxLng) maxLng = lng;
//     }
//     const midLat = (minLat + maxLat) / 2;
//     const midLng = (minLng + maxLng) / 2;
//     const latDelta = Math.max(0.02, (maxLat - minLat) * 1.5 || 0.05);
//     const lngDelta = Math.max(0.02, (maxLng - minLng) * 1.5 || 0.05);
//     return {
//       latitude: midLat,
//       longitude: midLng,
//       latitudeDelta: latDelta,
//       longitudeDelta: lngDelta,
//     };
//   };

//   useEffect(() => {
//     loadRecommendations();
//     getCurrentLocation();
//   }, []);

//   const loadRecommendations = async () => {
//     try {
//       console.log("🗺️ Map: loading recommendations from storage...");
//       const storedRecommendations = await AsyncStorage.getItem("latest_recommendations");
      
//       if (storedRecommendations) {
//         const parsed = JSON.parse(storedRecommendations);
//         console.log("🗺️ Map: parsed recommendations type:", Array.isArray(parsed) ? 'array' : typeof parsed);

//         // Helper to geocode any item lacking valid coordinates, using cache
//         const enrichItems = async (items: Recommendation[]) => {
//           console.log(`🗺️ Map: enriching ${items.length} items for coordinates...`);
//           const enriched = await Promise.all(
//             items.map(async (item) => {
//               const hasValidCoords = Number.isFinite(item.latitude) && Number.isFinite(item.longitude);
//               const query = (item.address && item.address.trim()) || (item.title && item.title.trim()) || '';
//               if (!hasValidCoords && query) {
//                 try {
//                   const cacheKey = query.toLowerCase();
//                   const cached = geocodeCacheRef.current.get(cacheKey);
//                   if (cached) {
//                     console.log("🗺️ Map: cache hit for", query, cached);
//                     return { ...item, latitude: cached.lat, longitude: cached.lng } as Recommendation;
//                   }
//                   console.log("🗺️ Map: geocoding", query);
//                   const results = await geocodeAddress(query);
//                   const r0 = results?.[0];
//                   if (r0?.geometry?.location) {
//                     const coords = { lat: r0.geometry.location.lat, lng: r0.geometry.location.lng };
//                     geocodeCacheRef.current.set(cacheKey, coords);
//                     console.log("🗺️ Map: geocode success", query, coords);
//                     return { ...item, latitude: coords.lat, longitude: coords.lng } as Recommendation;
//                   }
//                   console.log("🗺️ Map: geocode returned no results for", query);
//                 } catch {}
//               }
//               return item;
//             })
//           );
//           const withCoords = enriched.filter(e => Number.isFinite(e.latitude) && Number.isFinite(e.longitude)).length;
//           console.log(`🗺️ Map: enriched pins with coords: ${withCoords}/${enriched.length}`);
//           return enriched;
//         };

//         if (Array.isArray(parsed)) {
//           // Legacy array format: normalize and enrich
//           const flatLegacy: Recommendation[] = parsed.map((rec: any, idx: number) => ({
//             activity_id: rec.activity_id || `legacy_${idx}_${rec.title || rec.name || 'opportunity'}`,
//             title: rec.title || rec.name || 'Opportunity',
//             category: (rec.category || 'opportunity').toString().toLowerCase(),
//             address: rec.address || rec.location || '',
//             latitude: rec.latitude,
//             longitude: rec.longitude,
//           }));
//           console.log("🗺️ Map: legacy items count:", flatLegacy.length);
//           const enrichedLegacy = await enrichItems(flatLegacy);
//           setRecommendations(enrichedLegacy);
//           const fit = computeRegionForMarkers(enrichedLegacy);
//           if (fit) setRegion(fit);
//         } else if (parsed && typeof parsed === 'object') {
//           // Comprehensive schema: flatten and enrich
//           const flatten = (domainKey: string, domain: any) =>
//             (domain?.local_opportunities || []).map((op: any, idx: number) => ({
//               activity_id: `${domainKey}_${idx}_${op.name}`,
//               title: op.name,
//               category: domainKey,
//               address: op.address,
//               latitude: op.latitude,
//               longitude: op.longitude,
//             }));
//           const flat: Recommendation[] = [
//             ...flatten('cognitive', parsed.cognitive),
//             ...flatten('physical', parsed.physical),
//             ...flatten('emotional', parsed.emotional),
//             ...flatten('social', parsed.social),
//           ];
//           console.log("🗺️ Map: comprehensive items by domain:", {
//             cognitive: (parsed.cognitive?.local_opportunities || []).length,
//             physical: (parsed.physical?.local_opportunities || []).length,
//             emotional: (parsed.emotional?.local_opportunities || []).length,
//             social: (parsed.social?.local_opportunities || []).length,
//             total: flat.length,
//           });
//           const enriched = await enrichItems(flat);
//           setRecommendations(enriched);
//           const fit = computeRegionForMarkers(enriched);
//           if (fit) setRegion(fit);
//         }
//       }
//     } catch (error) {
//       console.error("Error loading recommendations for map:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCurrentLocation = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status === "granted") {
//         const location = await Location.getCurrentPositionAsync({});
//         setRegion({
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//           latitudeDelta: 0.0922,
//           longitudeDelta: 0.0421,
//         });
//       }
//     } catch (error) {
//       console.error("Error getting location:", error);
//     }
//   };

//   const getCategoryColor = (category: string) => {
//     const colors = {
//       physical: "#4CAF50",
//       cognitive: "#2196F3", 
//       emotional: "#FF9800",
//       social: "#9C27B0",
//     };
//     return colors[category as keyof typeof colors] || "#666";
//   };

//   if (Platform.OS === "web") {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.webContainer}>
//           <Text style={styles.webTitle}>Map View</Text>
//           <Text style={styles.webText}>
//             Map functionality is not available on web. Please use the mobile app to view activity locations.
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="rgba(255,79,97,1)" />
//           <Text style={styles.loadingText}>Loading activity locations...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Activity Locations</Text>
//         <Text style={styles.subtitle}>
//           {recommendations.length} activities near you
//         </Text>
//       </View>

//       <View style={styles.mapContainer}>
//         {MapView && (
//           <MapView
//             style={styles.map}
//             region={region}
//             onRegionChangeComplete={setRegion}
//           >
//             {recommendations
//               .filter((rec) => typeof rec.latitude === 'number' && typeof rec.longitude === 'number')
//               .map((rec) => (
//                 <Marker
//                   key={rec.activity_id}
//                   coordinate={{
//                     latitude: rec.latitude as number,
//                     longitude: rec.longitude as number,
//                   }}
//                   title={rec.title}
//                   description={`${rec.category.charAt(0).toUpperCase() + rec.category.slice(1)} Development`}
//                   pinColor={getCategoryColor(rec.category)}
//                 />
//               ))}
//           </MapView>
//         )}
//       </View>

//       {/* Legend */}
//       <View style={styles.legend}>
//         <Text style={styles.legendTitle}>Categories</Text>
//         <View style={styles.legendItems}>
//           {["physical", "cognitive", "emotional", "social"].map((category) => (
//             <View key={category} style={styles.legendItem}>
//               <View 
//                 style={[
//                   styles.legendDot, 
//                   { backgroundColor: getCategoryColor(category) }
//                 ]} 
//               />
//               <Text style={styles.legendText}>
//                 {category.charAt(0).toUpperCase() + category.slice(1)}
//               </Text>
//             </View>
//           ))}
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: SPACING.md,
//     color: "#666",
//     fontSize: 16,
//   },
//   webContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: SPACING.lg,
//   },
//   webTitle: {
//     fontSize: 24,
//     fontWeight: "800",
//     color: "#333",
//     marginBottom: SPACING.md,
//   },
//   webText: {
//     fontSize: 16,
//     color: "#666",
//     textAlign: "center",
//     lineHeight: 24,
//   },
//   header: {
//     padding: SPACING.lg,
//     paddingBottom: SPACING.md,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "800",
//     color: "#333",
//     marginBottom: SPACING.xs,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#666",
//   },
//   mapContainer: {
//     flex: 1,
//     margin: SPACING.lg,
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   map: {
//     flex: 1,
//   },
//   legend: {
//     padding: SPACING.lg,
//     paddingTop: SPACING.md,
//   },
//   legendTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#333",
//     marginBottom: SPACING.sm,
//   },
//   legendItems: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//   },
//   legendItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: SPACING.lg,
//     marginBottom: SPACING.xs,
//   },
//   legendDot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: SPACING.xs,
//   },
//   legendText: {
//     fontSize: 14,
//     color: "#666",
//   },
// });