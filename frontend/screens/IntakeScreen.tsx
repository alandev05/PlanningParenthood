import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Header from "../components/Header";
import { TreeDoodle } from "../components/Doodles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { SPACING } from "../lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IntakeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [zip, setZip] = useState("");
  const [age, setAge] = useState(6);
  const [budget, setBudget] = useState(50);
  const [transport, setTransport] = useState<
    "car" | "public" | "walk" | "other"[]
  >([] as any);
  const [weekend, setWeekend] = useState(true);
  const [happiness, setHappiness] = useState(6);
  const [success, setSuccess] = useState(6);
  const [social, setSocial] = useState(6);
  const [health, setHealth] = useState(6);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header
        title="Tell us a little"
        subtitle="We only need ZIP & age. No account required."
        doodle={false}
      />
      <TreeDoodle style={styles.tree} />

      <View style={styles.form}>
        <Text style={styles.label}>ZIP</Text>
        <TextInput
          style={styles.input}
          value={zip}
          onChangeText={setZip}
          placeholder="02139"
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Child Age: {age}</Text>
        <View style={styles.sliderRow}>
          <TouchableOpacity
            style={styles.stepper}
            onPress={() => setAge(Math.max(0, age - 1))}
          >
            <Text>-</Text>
          </TouchableOpacity>
          <View style={styles.ageBox}>
            <Text style={{ fontWeight: "700" }}>{age}</Text>
          </View>
          <TouchableOpacity
            style={styles.stepper}
            onPress={() => setAge(Math.min(18, age + 1))}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Budget / month: ${budget}</Text>
        <View style={styles.sliderRow}>
          <TouchableOpacity
            style={styles.stepper}
            onPress={() => setBudget(Math.max(0, budget - 10))}
          >
            <Text>-</Text>
          </TouchableOpacity>
          <View style={styles.ageBox}>
            <Text style={{ fontWeight: "700" }}>${budget}</Text>
          </View>
          <TouchableOpacity
            style={styles.stepper}
            onPress={() => setBudget(budget + 10)}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Availability</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={[styles.chip, weekend ? styles.chipActive : {}]}
            onPress={() => setWeekend((w) => !w)}
          >
            <Text>Weekend</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, !weekend ? styles.chipActive : {}]}
            onPress={() => setWeekend((w) => !w)}
          >
            <Text>Weekday</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Priorities</Text>
        <Text>Happiness {happiness}</Text>
        <View style={styles.priorityRow}>
          <TouchableOpacity
            style={styles.smallStep}
            onPress={() => setHappiness(Math.max(0, happiness - 1))}
          >
            <Text>-</Text>
          </TouchableOpacity>
          <View style={styles.progress}>
            <View
              style={[
                styles.progressInner,
                { width: `${(happiness / 10) * 100}%` },
              ]}
            />
          </View>
          <TouchableOpacity
            style={styles.smallStep}
            onPress={() => setHappiness(Math.min(10, happiness + 1))}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>

        <Text>Success {success}</Text>
        <View style={styles.priorityRow}>
          <TouchableOpacity
            style={styles.smallStep}
            onPress={() => setSuccess(Math.max(0, success - 1))}
          >
            <Text>-</Text>
          </TouchableOpacity>
          <View style={styles.progress}>
            <View
              style={[
                styles.progressInner,
                { width: `${(success / 10) * 100}%` },
              ]}
            />
          </View>
          <TouchableOpacity
            style={styles.smallStep}
            onPress={() => setSuccess(Math.min(10, success + 1))}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>

        <Text>Social {social}</Text>
        <View style={styles.priorityRow}>
          <TouchableOpacity
            style={styles.smallStep}
            onPress={() => setSocial(Math.max(0, social - 1))}
          >
            <Text>-</Text>
          </TouchableOpacity>
          <View style={styles.progress}>
            <View
              style={[
                styles.progressInner,
                { width: `${(social / 10) * 100}%` },
              ]}
            />
          </View>
          <TouchableOpacity
            style={styles.smallStep}
            onPress={() => setSocial(Math.min(10, social + 1))}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>

        <Text>Health {health}</Text>
        <View style={styles.priorityRow}>
          <TouchableOpacity
            style={styles.smallStep}
            onPress={() => setHealth(Math.max(0, health - 1))}
          >
            <Text>-</Text>
          </TouchableOpacity>
          <View style={styles.progress}>
            <View
              style={[
                styles.progressInner,
                { width: `${(health / 10) * 100}%` },
              ]}
            />
          </View>
          <TouchableOpacity
            style={styles.smallStep}
            onPress={() => setHealth(Math.min(10, health + 1))}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.continue}
          onPress={() =>
            navigation.navigate("Results", {
              zip: zip || undefined,
              age,
              demo: zip === undefined || zip.trim() === "",
            })
          }
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.kidQuiz}
          onPress={() => {
            /* placeholder */
          }}
        >
          <Text style={{ color: "#FF4F61", fontWeight: "700" }}>
            Take kid quiz
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  tree: {
    position: "absolute",
    left: SPACING.md - 4,
    bottom: SPACING.lg - SPACING.sm,
    opacity: 0.9,
  },
  form: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  label: { fontWeight: "700", marginBottom: SPACING.sm - 2 },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    padding: SPACING.md - 4,
    borderRadius: 12,
    marginBottom: SPACING.md - 4,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md - 4,
  },
  stepper: {
    padding: SPACING.md - 4,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
  },
  ageBox: { paddingHorizontal: SPACING.lg, alignItems: "center" },
  chip: {
    padding: SPACING.sm + 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: SPACING.sm,
  },
  chipActive: { backgroundColor: "rgba(110,186,166,0.1)" },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  smallStep: {
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  progress: {
    flex: 1,
    height: 10,
    backgroundColor: "#f0f0f0",
    marginHorizontal: SPACING.sm,
    borderRadius: 6,
  },
  progressInner: {
    height: "100%",
    backgroundColor: "rgba(255,79,97,0.9)",
    borderRadius: 6,
  },
  continue: {
    marginTop: SPACING.md,
    backgroundColor: "rgba(255,79,97,1)",
    padding: SPACING.md - 2,
    borderRadius: 16,
    alignItems: "center",
  },
  kidQuiz: {
    marginTop: SPACING.md - 4,
    marginBottom: SPACING.xl,
    alignItems: "center",
  },
});
