import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft, X } from "lucide-react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { saveKidTraits, KidTraits } from "../lib/apiService";
import { apiClient } from "../lib/apiClient";

type Question = {
  id: string;
  leftLabel: string;
  rightLabel: string;
  traitKey: string; // which trait this maps to
  description?: string;
};

const { width } = Dimensions.get("window");

// 6 questions mapping to trait keys
const DEFAULT_QUESTIONS: Question[] = [
  {
    id: "q1",
    leftLabel: "Creative",
    rightLabel: "Analytical",
    traitKey: "creativity",
  },
  {
    id: "q2",
    leftLabel: "Team Player",
    rightLabel: "Solo",
    traitKey: "sociability",
  },
  {
    id: "q3",
    leftLabel: "Outdoorsy",
    rightLabel: "Indoorsy",
    traitKey: "outdoors",
  },
  {
    id: "q4",
    leftLabel: "Athletic",
    rightLabel: "Calm/Quiet",
    traitKey: "energy",
  },
  {
    id: "q5",
    leftLabel: "Curious",
    rightLabel: "Focused",
    traitKey: "curiosity",
  },
  {
    id: "q6",
    leftLabel: "Hands-on",
    rightLabel: "Screen/Books",
    traitKey: "kinesthetic",
  },
];

const TRAIT_KEYS = Array.from(
  new Set(DEFAULT_QUESTIONS.map((q) => q.traitKey))
);

export default function KidQuizModal() {
  const navigation = useNavigation();
  const route = useRoute();

  const questions = DEFAULT_QUESTIONS;
  const total = questions.length;

  const [index, setIndex] = useState(0);
  // store slider values 0..1 where 0 = leftLabel, 1 = rightLabel
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    questions.forEach((q) => (init[q.id] = 0.5));
    return init;
  });

  const [saving, setSaving] = useState(false);

  // Load existing quiz results on mount
  useEffect(() => {
    const loadExistingResults = async () => {
      try {
        // Try to load from backend first
        const familyId = await AsyncStorage.getItem("current_family_id") || "default_user";
        const userData = await apiClient.get(`/api/user/${familyId}`);
        if (userData) {
          if (userData.kid_traits) {
            console.log("📊 Loaded existing quiz results:", userData.kid_traits);
            // Convert traits back to question values
            const newValues = { ...values };
            questions.forEach(q => {
              if (userData.kid_traits[q.traitKey]) {
                newValues[q.id] = userData.kid_traits[q.traitKey];
              }
            });
            setValues(newValues);
            return;
          }
        }
        
        // Fallback to local storage
        const stored = await AsyncStorage.getItem("kid_trait_weights");
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log("📱 Loaded quiz results from local storage:", parsed);
          const newValues = { ...values };
          questions.forEach(q => {
            if (parsed[q.traitKey]) {
              newValues[q.id] = parsed[q.traitKey];
            }
          });
          setValues(newValues);
        }
      } catch (error) {
        console.log("Could not load existing quiz results:", error);
      }
    };
    
    loadExistingResults();
  }, []);

  const progress = useMemo(() => {
    return (index + 1) / total;
  }, [index, total]);

  function handleValueChange(questionId: string, v: number) {
    setValues((prev) => ({ ...prev, [questionId]: v }));
  }

  function goNext() {
    if (index < total - 1) setIndex((i) => i + 1);
    else handleFinish();
  }

  function goBack() {
    if (index > 0) setIndex((i) => i - 1);
    else navigation.goBack();
  }

  async function handleFinish() {
    // compute trait weights by averaging mapped questions
    const traitAcc: Record<string, number[]> = {};
    for (const q of questions) {
      traitAcc[q.traitKey] = traitAcc[q.traitKey] || [];
      // center value around 0: -1..1 where -1 favors leftLabel, 1 favors rightLabel
      const centered = (values[q.id] - 0.5) * 2;
      traitAcc[q.traitKey].push(centered);
    }
    const traitScores: Record<string, number> = {};
    for (const k of Object.keys(traitAcc)) {
      const arr = traitAcc[k];
      const avg = arr.reduce((s, a) => s + a, 0) / arr.length; // -1..1
      // convert to 0..1 scale where 0.5 is neutral
      traitScores[k] = (avg + 1) / 2;
    }

    // normalize weights so sum = 1 (keeps relative importance)
    const sum = Object.values(traitScores).reduce((s, a) => s + a, 0) || 1;
    const normalized: Record<string, number> = {};
    for (const k of Object.keys(traitScores)) {
      normalized[k] = +(traitScores[k] / sum).toFixed(3);
    }

    setSaving(true);
    try {
      // Save to local storage
      await AsyncStorage.setItem(
        "kid_trait_weights",
        JSON.stringify(normalized)
      );

      // Try to save to backend
      const familyId = await AsyncStorage.getItem("current_family_id") || "default_user";
      const traits: KidTraits = {
        creativity: normalized.creativity || 0.5,
        sociability: normalized.sociability || 0.5,
        outdoors: normalized.outdoors || 0.5,
        energy: normalized.energy || 0.5,
        curiosity: normalized.curiosity || 0.5,
        kinesthetic: normalized.kinesthetic || 0.5,
      };

      console.log("💾 Saving traits to backend:", traits);
      
      // Set a timeout for the save operation
      const savePromise = saveKidTraits(familyId, traits);
      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve({ success: false, error: "Timeout" }), 5000)
      );
      
      const response = await Promise.race([savePromise, timeoutPromise]) as any;
      
      if (!response.success) {
        console.warn("Failed to save traits to backend:", response.error);
      } else {
        console.log("✅ Traits saved to backend successfully");
      }
    } catch (e) {
      console.warn("Failed to save kid trait weights", e);
    }
    
    setSaving(false);

    // If called from intake, close quiz first so parent can show transition
    if (route.params && typeof (route.params as any).onComplete === 'function') {
      navigation.goBack();
      // Defer parent submission slightly to allow the modal transition to display
      setTimeout(() => {
        try {
          (route.params as any).onComplete(normalized);
        } catch (e) {
          console.warn('onComplete handler failed', e);
        }
      }, 120);
      return;
    }

    // Default behavior: go to Settings
    navigation.navigate('Settings' as never);
  }

  function handleSkip() {
    // Clear any saved weights and close
    AsyncStorage.removeItem("kid_trait_weights").catch(() => null);
    navigation.goBack();
  }

  const q = questions[index];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => {
            // Notify parent we’re starting so it can show transition immediately
            if (route.params && typeof (route.params as any).onBegin === 'function') {
              try { (route.params as any).onBegin(); } catch {}
            }
            goBack();
          }} style={styles.iconButton}>
            <ChevronLeft color="#FF4F61" size={20} />
          </Pressable>
          <Text style={styles.title}>Personality Assessment</Text>
          <View style={styles.iconButton} />
        </View>

        <Text style={styles.smallInfo}>This is your child's personality quiz. Please answer about your child.</Text>

        <View style={styles.progressRow}>
          <View style={[styles.progressBarTrack]}>
            <View
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {index + 1}/{total}
          </Text>
        </View>

        <View style={styles.cardWrap}>
          <Text style={styles.questionTitle}>
            {q.leftLabel} — {q.rightLabel}
          </Text>
          {q.description ? (
            <Text style={styles.questionDesc}>{q.description}</Text>
          ) : null}

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>{q.leftLabel}</Text>
            <Slider
              style={{ flex: 1, marginHorizontal: 12 }}
              minimumValue={0}
              maximumValue={1}
              value={values[q.id]}
              minimumTrackTintColor="#FF4F61"
              maximumTrackTintColor="#E6E6E6"
              thumbTintColor={Platform.OS === "ios" ? "#FFFFFF" : "#FF4F61"}
              onValueChange={(v) => handleValueChange(q.id, v)}
            />
            <Text style={styles.sliderLabel}>{q.rightLabel}</Text>
          </View>

          <View style={[
            styles.navigationRow,
            index === total - 1 && { flexDirection: 'column', alignItems: 'stretch' }
          ]}>
            <TouchableOpacity onPress={goBack} style={styles.ghostButton}>
              <Text style={styles.ghostText}>Back</Text>
            </TouchableOpacity>
            {index < total - 1 ? (
              <TouchableOpacity onPress={goNext} style={styles.primaryButton}>
                <Text style={styles.primaryText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleFinish} style={[styles.primaryButton, styles.finalCta]}>
                <Text style={styles.primaryText}>Create Your Parent Plan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          {/* bird doodle */}
          <View style={styles.doodleWrap} pointerEvents="none">
            <Svg width={60} height={40} viewBox="0 0 60 40">
              <Path
                d="M5 30 C12 18, 22 12, 35 12 C43 12, 52 16, 55 21 C52 18, 46 13, 35 15 C22 18, 12 22, 5 30 Z"
                fill="#E6F7F2"
              />
              <Circle cx="36" cy="13" r="3" fill="#FF4F61" />
            </Svg>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, padding: 16, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconButton: { padding: 8 },
  title: { fontSize: 20, fontWeight: "700", color: "#0A0A0A" },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: { height: 8, backgroundColor: "rgba(255,79,97,1)" },
  progressText: { marginLeft: 12, color: "#999", fontWeight: "600" },
  cardWrap: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 8,
  },
  questionDesc: { color: "#666", marginBottom: 12 },
  sliderRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  sliderLabel: { width: 70, color: "#333", fontWeight: "600" },
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  ghostButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#F8F8F8",
  },
  ghostText: { color: "#666", fontWeight: "700" },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "rgba(255,79,97,1)",
  },
  primaryText: { color: "#FFF", fontWeight: "700" },
  footer: { marginTop: 24, alignItems: "center" },
  smallInfo: { marginBottom: 8 },
  footerText: { color: "#777" },
  doodleWrap: { position: "absolute", right: 12, bottom: 6, opacity: 0.95 },
});
