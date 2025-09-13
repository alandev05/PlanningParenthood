import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Header from "../components/Header";
import { fetchDemoPrograms, DEMO_ZIP } from "../lib/demoData";
import ProgramCard from "../components/ProgramCard";
import FABChat from "../components/FABChat";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { SunCloud } from "../components/Doodles";
import { SPACING } from "../lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";

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
    return () => clearTimeout(t);
  }, [zip, age]);

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
      ) : (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#666" }}>
            Map view placeholder — integrate MapView in production.
          </Text>
        </View>
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
  cloud: {
    position: "absolute",
    right: SPACING.lg - SPACING.sm,
    top: SPACING.lg - SPACING.sm,
    opacity: 0.9,
  },
  controls: {
    padding: SPACING.md - 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    padding: SPACING.sm,
    borderRadius: 10,
    marginRight: SPACING.sm,
    backgroundColor: "#f5f5f5",
  },
  toggleActive: { backgroundColor: "rgba(255,79,97,0.12)" },
  filterChip: {
    padding: SPACING.sm,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginLeft: SPACING.sm,
  },
});
