import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { TreeDoodle } from "../components/Doodles";
import { useRoute } from "@react-navigation/native";

export default function ProgramDetailScreen() {
  const route: any = useRoute();
  const { id, program: passedProgram } = route.params || {};
  const program = passedProgram || {
    id,
    title: "Program",
    priceMonthly: undefined,
    distanceMiles: 0,
    ageRange: [0, 0],
    why: "",
    address: "",
    phone: "",
  };
  const [saved, setSaved] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title={program.title}
        subtitle={`${program.distanceMiles ?? 0} mi • Ages ${program.ageRange?.[0] ?? 0}–${program.ageRange?.[1] ?? 0}`}
        doodle={false}
        showBack={true}
      />
      <TreeDoodle style={styles.tree} />

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.save}
          onPress={() => setSaved((s) => !s)}
        >
          <Text style={{ fontSize: 20 }}>{saved ? "♥" : "♡"}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Why this fits</Text>
        <Text style={styles.paragraph}>{program.why}</Text>

        <Text style={styles.sectionTitle}>Cost</Text>
        <Text style={styles.paragraph}>
          {program.priceMonthly == null || program.priceMonthly === 0
            ? "Free"
            : `$${program.priceMonthly}/month`}
        </Text>

        <Text style={styles.sectionTitle}>Address</Text>
        <Text style={styles.paragraph}>{program.address || ""}</Text>

        <Text style={styles.sectionTitle}>Parent Quotes</Text>
        <Text style={styles.paragraph}>
          "My child loved the instructors and came home excited every week." —
          Local Parent
        </Text>

        <View style={{ height: 12 }} />
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              /* open site placeholder */
            }}
          >
            <Text style={{ color: "#fff" }}>Open Site</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#6EBAA6" }]}
            onPress={() => {
              if (program.phone) {
                Linking.openURL(`tel:${program.phone}`);
              }
            }}
          >
            <Text style={{ color: "#fff" }}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee" },
            ]}
            onPress={() => {
              /* add to plan */
            }}
          >
            <Text>Add to Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  tree: { position: "absolute", right: 12, top: 18, opacity: 0.9 },
  content: { padding: 16, paddingBottom: 32 },
  save: { position: "absolute", right: 24, top: 120 },
  sectionTitle: { marginTop: 12, fontWeight: "800" },
  paragraph: { color: "#444", marginTop: 6 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  actionBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,79,97,1)",
    flex: 1,
    alignItems: "center",
    marginRight: 8,
  },
});
