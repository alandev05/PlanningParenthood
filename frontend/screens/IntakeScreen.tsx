import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Header from "../components/Header";
import { TreeDoodle } from "../components/Doodles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { SPACING } from "../lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Option sets ------------------------------------------------------------
const SUPPORT_OPTIONS = [
  "Spouse/partner",
  "Extended family",
  "Carpool friends",
  "None",
] as const;

const TRANSPORT_OPTIONS = [
  "Car",
  "Public transit",
  "Walk/Bike",
  "Rideshare only",
] as const;

const PARENTING_STYLES = ["Hands off", "Balanced", "Hands on"] as const;

const AREA_TYPES = ["Suburb", "Rural", "Urban"] as const;

type Support = (typeof SUPPORT_OPTIONS)[number];
type Transport = (typeof TRANSPORT_OPTIONS)[number];
type ParentingStyle = (typeof PARENTING_STYLES)[number];
type AreaType = (typeof AREA_TYPES)[number];

type PriorityKey = "Social" | "Emotional" | "Physical" | "Cognitive";

// Simple chip component
function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : undefined]}
    >
      <Text style={{ fontWeight: "600" }}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function IntakeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // ------------------- PART 1: The parent -----------------------------------
  const [budgetPerWeek, setBudgetPerWeek] = useState<number>(50); // $
  const [supports, setSupports] = useState<Support[]>([]);
  const [transport, setTransport] = useState<Transport | null>(null);
  const [hoursPerWeekWithKid, setHoursPerWeekWithKid] = useState<number>(5);
  const [hasSpouse, setHasSpouse] = useState<boolean>(false);
  const [parentingStyle, setParentingStyle] = useState<ParentingStyle | null>(
    null
  );
  const [numKids, setNumKids] = useState<number>(1);
  const [childAge, setChildAge] = useState<number>(6);
  const [areaType, setAreaType] = useState<AreaType | null>(null);

  // ------------------- Multi-step flow --------------------------------------
  const [step, setStep] = useState<number>(0); // 0..3
  const totalSteps = 4;

  // ------------------- PART 2: Priorities (Ranking) -------------------------
  // Keep an ordered list; earlier = higher priority (1..4)
  const [priorityOrder, setPriorityOrder] = useState<PriorityKey[]>([
    "Social",
    "Emotional",
    "Physical",
    "Cognitive",
  ]);

  const movePriority = (index: number, dir: "up" | "down") => {
    setPriorityOrder((prev) => {
      const next = [...prev];
      const swapWith = dir === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= next.length) return prev;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  };

  // Multi-select toggler for Support
  const toggleSupport = (opt: Support) => {
    setSupports((prev) =>
      prev.includes(opt) ? prev.filter((s) => s !== opt) : [...prev, opt]
    );
  };

  // --------------- Backend payload (easy to connect) ------------------------
  const payload = useMemo(
    () => ({
      budget_per_week_usd: budgetPerWeek,
      support_available: supports, // string[]
      transport: transport, // string | null
      hours_per_week_with_kid: hoursPerWeekWithKid,
      spouse: hasSpouse, // boolean
      parenting_style: parentingStyle, // string | null
      number_of_kids: numKids,
      child_age: childAge,
      area_type: areaType, // string | null
      priorities_ranked: priorityOrder, // e.g., ["Social","Emotional","Physical","Cognitive"]
    }),
    [
      budgetPerWeek,
      supports,
      transport,
      hoursPerWeekWithKid,
      hasSpouse,
      parentingStyle,
      numKids,
      childAge,
      areaType,
      priorityOrder,
    ]
  );

  // Example submit: POST then navigate (swap URL to yours)
  const handleSubmit = async () => {
    // minimal client-side checks
    if (!transport || !parentingStyle || !areaType) {
      Alert.alert(
        "Missing info",
        "Please select Transport, Parenting style, and Area."
      );
      return;
    }
    try {
      // Replace with your endpoint or lift state up instead
      await fetch("https://example.com/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // Non-blocking: still allow navigation for demo purposes
      console.log("Submit error (continuing to Results):", e);
    } finally {
      navigation.navigate("Results");
    }
  };

  const goNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else handleSubmit();
  };

  const goBack = () => setStep(Math.max(0, step - 1));

  const StepTitle = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.sectionTitle}>{children}</Text>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header
        title="Parent & Priorities"
        subtitle={`Step ${step + 1} of ${totalSteps}`}
        doodle={false}
      />
      <TreeDoodle style={styles.tree} />

      <View style={{ flex: 1 }}>
        <View style={styles.form}>
          {step === 0 && (
            <>
              <StepTitle>Budget, Support, Transport</StepTitle>

              <Text style={styles.label}>
                Budget for kid / week: ${budgetPerWeek}
              </Text>
              <Row>
                <Step
                  onPress={() =>
                    setBudgetPerWeek(Math.max(0, budgetPerWeek - 5))
                  }
                >
                  -
                </Step>
                <ValueBox>${budgetPerWeek}</ValueBox>
                <Step onPress={() => setBudgetPerWeek(budgetPerWeek + 5)}>
                  +
                </Step>
              </Row>

              <Text style={[styles.label, styles.mt]}>Support available</Text>
              <Wrap>
                {SUPPORT_OPTIONS.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    active={supports.includes(opt)}
                    onPress={() => toggleSupport(opt)}
                  />
                ))}
              </Wrap>

              <Text style={[styles.label, styles.mt]}>Transportation</Text>
              <Wrap>
                {TRANSPORT_OPTIONS.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    active={transport === opt}
                    onPress={() => setTransport(opt)}
                  />
                ))}
              </Wrap>
            </>
          )}

          {step === 1 && (
            <>
              <StepTitle>Time, Spouse, Style</StepTitle>

              <Text style={[styles.label, styles.mt]}>
                Time to spend with kid each week (hrs): {hoursPerWeekWithKid}
              </Text>
              <Row>
                <Step
                  onPress={() =>
                    setHoursPerWeekWithKid(Math.max(0, hoursPerWeekWithKid - 1))
                  }
                >
                  -
                </Step>
                <ValueBox>{hoursPerWeekWithKid}h</ValueBox>
                <Step
                  onPress={() =>
                    setHoursPerWeekWithKid(hoursPerWeekWithKid + 1)
                  }
                >
                  +
                </Step>
              </Row>

              <Text style={[styles.label, styles.mt]}>Spouse?</Text>
              <Row>
                <Chip
                  label="Yes"
                  active={hasSpouse === true}
                  onPress={() => setHasSpouse(true)}
                />
                <Chip
                  label="No"
                  active={hasSpouse === false}
                  onPress={() => setHasSpouse(false)}
                />
              </Row>

              <Text style={[styles.label, styles.mt]}>
                Preferred parenting style
              </Text>
              <Wrap>
                {PARENTING_STYLES.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    active={parentingStyle === opt}
                    onPress={() => setParentingStyle(opt)}
                  />
                ))}
              </Wrap>
            </>
          )}

          {step === 2 && (
            <>
              <StepTitle>Kids & Area</StepTitle>

              <Text style={[styles.label, styles.mt]}>
                How many kids? {numKids}
              </Text>
              <Row>
                <Step onPress={() => setNumKids(Math.max(1, numKids - 1))}>
                  -
                </Step>
                <ValueBox>{numKids}</ValueBox>
                <Step onPress={() => setNumKids(numKids + 1)}>+</Step>
              </Row>

              <Text style={[styles.label, styles.mt]}>
                How old is your child
              </Text>
              <Row>
                <Step onPress={() => setChildAge(Math.max(0, childAge - 1))}>
                  -
                </Step>
                <ValueBox>{childAge}</ValueBox>
                <Step onPress={() => setChildAge(Math.min(18, childAge + 1))}>
                  +
                </Step>
              </Row>

              <Text style={[styles.label, styles.mt]}>
                Do you live in suburb, rural, or urban area
              </Text>
              <Wrap>
                {AREA_TYPES.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    active={areaType === opt}
                    onPress={() => setAreaType(opt)}
                  />
                ))}
              </Wrap>
            </>
          )}

          {step === 3 && (
            <>
              <StepTitle>Priorities (rank 1 → 4)</StepTitle>
              <Text style={styles.helperText}>
                Put your highest priority at the top.
              </Text>

              {priorityOrder.map((p, idx) => (
                <View key={p} style={styles.priorityRow}>
                  <Text style={styles.priorityBadge}>{idx + 1}</Text>
                  <Text style={styles.priorityLabel}>{p}</Text>
                  <View style={{ flexDirection: "row", marginLeft: "auto" }}>
                    <TouchableOpacity
                      style={styles.arrowBtn}
                      onPress={() => movePriority(idx, "up")}
                    >
                      <Text>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.arrowBtn, { marginLeft: 6 }]}
                      onPress={() => movePriority(idx, "down")}
                    >
                      <Text>↓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.kidQuiz}
                onPress={() => navigation.navigate("KidQuiz" as any)}
              >
                <Text style={{ color: "#FF4F61", fontWeight: "700" }}>
                  Take kid quiz
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ paddingHorizontal: SPACING.lg }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity
              onPress={goBack}
              disabled={step === 0}
              style={[
                styles.continue,
                { paddingVertical: SPACING.sm, opacity: step === 0 ? 0.5 : 1 },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goNext}
              style={[styles.continue, { paddingVertical: SPACING.sm }]}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>
                {step === totalSteps - 1 ? "Submit" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------- Small layout helpers (keep JSX tidy) ----------------------------
function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.sliderRow}>{children}</View>;
}
function Wrap({ children }: { children: React.ReactNode }) {
  return <View style={styles.wrap}>{children}</View>;
}
function Step({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.stepper} onPress={onPress}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}
function ValueBox({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.valueBox}>
      <Text style={{ fontWeight: "700" }}>{children}</Text>
    </View>
  );
}

// ------------------------------- Styles -------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: SPACING.xl },
  tree: {
    position: "absolute",
    left: SPACING.md - 4,
    bottom: SPACING.lg - SPACING.sm,
    opacity: 0.9,
  },
  form: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 18,
    marginBottom: SPACING.sm,
  },
  helperText: { color: "#666", marginBottom: SPACING.sm - 2 },
  label: { fontWeight: "700", marginBottom: SPACING.sm - 2 },
  mt: { marginTop: SPACING.md },
  mtLg: { marginTop: SPACING.lg },
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
  valueBox: {
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
  },
  chip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: "rgba(110,186,166,0.12)" },
  wrap: { flexDirection: "row", flexWrap: "wrap" },
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
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  priorityBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,79,97,0.12)",
    textAlign: "center",
    textAlignVertical: "center" as any,
    overflow: "hidden",
    marginRight: 10,
    color: "#333",
    fontWeight: "700",
  },
  priorityLabel: { fontSize: 16, fontWeight: "600" },
  arrowBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
});
