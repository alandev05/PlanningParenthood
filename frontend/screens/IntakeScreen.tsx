import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ActivityIndicator, TextInput } from "react-native";
import Header from "../components/Header";
import { TreeDoodle } from "../components/Doodles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { SPACING } from "../lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { createFamily, saveFamilyPriorities, FamilyData, FamilyPriorities } from "../lib/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [zipCode, setZipCode] = useState<string>("");

  // ------------------- Multi-step flow --------------------------------------
  const [step, setStep] = useState<number>(0); // 0..3
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  // Submit family data to backend
  const handleSubmit = async () => {
    console.log("🚀 handleSubmit called");
    
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("⚠️ Already submitting, ignoring duplicate request");
      return;
    }
    
    // Client-side validation
    if (!transport || !parentingStyle || !areaType) {
      Alert.alert(
        "Missing Information",
        "Please complete all required fields:\n• Transportation method\n• Parenting style\n• Area type",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    setIsSubmitting(true);
    console.log("✅ Validation passed, starting submission...");

    try {
      console.log("🤖 Skipping family API - going directly to AI recommendations...");
      
      // Generate a temporary family ID for this session
      const tempFamilyId = `temp_${Date.now()}`;
      await AsyncStorage.setItem("current_family_id", tempFamilyId);
      console.log("Temporary family ID stored:", tempFamilyId);

      // Call the /api/recommend endpoint to get personalized recommendations
      console.log("🔍 Getting AI-powered recommendations...");
      try {
        const recommendationsData = await callRecommendAPI();
        console.log("✅ Successfully received AI recommendations:", recommendationsData);
        
        // Store AI recommendations for use in ResultsScreen
        if (recommendationsData.recommendations) {
          await AsyncStorage.setItem("latest_recommendations", JSON.stringify(recommendationsData.recommendations));
          console.log("💾 Stored comprehensive AI recommendations in AsyncStorage");
        }
        
        // Show success message
        Alert.alert(
          "AI Recommendations Ready! 🎉",
          "We created comprehensive personalized recommendations across 4 development areas for your child!",
          [{ text: "View My Plan", style: "default" }]
        );
      } catch (apiError: any) {
        console.warn("❌ API call failed:", apiError);
        const message = apiError?.message || String(apiError) || "Unknown error";
        Alert.alert("Request failed", message, [{ text: "OK", style: "default" }]);
      }

      // Navigate to Results tab with insights
      console.log("🧭 Navigating to Results tab with insights...");
      navigation.navigate("Results", { familyId: tempFamilyId });
      
    } catch (e: any) {
      console.error("💥 Submit error:", e);
      const message = e?.message || String(e) || "Unknown error";
      Alert.alert("Submission Error", message, [{ text: "OK", style: "default" }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Call the new /api/recommend GET endpoint
  const callRecommendAPI = async () => {
    try {
      // Get the current family ID from AsyncStorage
      const familyId = await AsyncStorage.getItem("current_family_id") || "default_user";
      console.log("🔍 Using family ID for recommendations:", familyId);
      
      // Build query parameters from the payload
      const params = new URLSearchParams();
      
      // Add family ID first so backend can retrieve kid traits
      params.append('family_id', familyId);
      
      // Add all the quiz variables as query parameters with proper formatting
      params.append('budget_per_week_usd', budgetPerWeek.toString());
      
      // Add support options (multiple values)
      supports.forEach(support => {
        params.append('support_available', encodeURIComponent(support));
      });
      
      if (transport) params.append('transport', encodeURIComponent(transport));
      params.append('hours_per_week_with_kid', hoursPerWeekWithKid.toString());
      
      // Fix boolean parameter formatting - convert to string
      params.append('spouse', hasSpouse ? 'true' : 'false');
      
      if (parentingStyle) params.append('parenting_style', encodeURIComponent(parentingStyle));
      params.append('number_of_kids', numKids.toString());
      params.append('child_age', childAge.toString());
      
      if (areaType) params.append('area_type', encodeURIComponent(areaType));
      
      // Add priorities (multiple values)
      priorityOrder.forEach(priority => {
        params.append('priorities_ranked', encodeURIComponent(priority));
      });

      // Try to include precise location if available
      try {
        // Dynamically import to avoid web bundle issues
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          if (loc?.coords) {
            params.append('lat', String(loc.coords.latitude));
            params.append('lng', String(loc.coords.longitude));
          }
        }
      } catch {}

      // Add zip if provided (backend can geocode to lat/lng)
      if (zipCode && zipCode.trim().length >= 3) {
        params.append('zip', encodeURIComponent(zipCode.trim()));
      }

      console.log('API request parameters:', params.toString());

      // Make the GET request to /api/recommend with improved error handling
      const computerIp = process.env.EXPO_PUBLIC_COMPUTER_IP || '10.189.115.63';
      const backendUrls = [
        `http://${computerIp}:8001`, // Your computer's actual IP (from .env)
        'http://localhost:8001',
        'http://127.0.0.1:8001',
        'http://192.168.1.100:8001', // Common home network IP
        'http://192.168.0.100:8001'  // Alternative home network IP
      ];
      
      let response = null;
      let lastError = null;
      const maxRetries = 1; // Reduced retries since we have longer timeout
      
      // Try each backend URL with exponential backoff
      for (let urlIndex = 0; urlIndex < backendUrls.length; urlIndex++) {
        const backendUrl = backendUrls[urlIndex];
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          const attemptLog = attempt > 0 ? ` (attempt ${attempt + 1}/${maxRetries + 1})` : '';
          
          try {
            console.log(`🤖 AI generating recommendations... ${backendUrl}${attemptLog}`);
            
            // Make request without client-side abort timeout
            response = await fetch(`${backendUrl}/api/recommend?${params.toString()}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              console.log(`✅ Successfully connected to: ${backendUrl}${attemptLog}`);
              break; // Success, exit both loops
            } else {
              console.log(`❌ Backend responded with status: ${response.status} ${response.statusText}`);
              lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
              
              // Don't retry on client errors (4xx), only on server errors (5xx) or network issues
              if (response.status >= 400 && response.status < 500) {
                break; // Don't retry client errors
              }
            }
          } catch (error) {
            const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
            console.log(`❌ Failed to connect to ${backendUrl}${attemptLog}: ${errorMsg}`);
            lastError = error;
            response = null;
            
            // Exponential backoff delay before retry (except on last attempt)
            if (attempt < maxRetries) {
              const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
              console.log(`⏳ Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        // If we got a successful response, break out of URL loop
        if (response && response.ok) {
          break;
        }
      }
      
      if (response && response.ok) {
        const data = await response.json();
        console.log("✅ Recommendations received:", data);
        
        // Accept both new object schema and legacy array format
        if (data && data.recommendations && typeof data.recommendations === 'object' && !Array.isArray(data.recommendations)) {
          // New comprehensive schema { cognitive, physical, emotional, social }
          await AsyncStorage.setItem("latest_recommendations", JSON.stringify(data.recommendations));
          console.log("📱 Stored comprehensive recommendations object in AsyncStorage");
          return data;
        } else if (data && Array.isArray(data.recommendations)) {
          // Legacy array format
          await AsyncStorage.setItem("latest_recommendations", JSON.stringify(data.recommendations));
          console.log(`📱 Stored ${data.recommendations.length} legacy recommendations in AsyncStorage`);
          return data;
        } else {
          console.warn("⚠️ Invalid response structure from backend");
          throw new Error("Invalid response format from server");
        }
      } else {
        // Provide detailed error information
        let errorMsg = "Unable to get recommendations";
        
        if (response) {
          errorMsg = `Server error (${response.status}): ${response.statusText}`;
        } else if (lastError) {
          if (lastError.name === 'AbortError') {
            errorMsg = "Request timed out - please check your internet connection";
          } else if (lastError.message.includes('Network request failed')) {
            errorMsg = "Network connection failed - please check your internet";
          } else {
            errorMsg = `Connection error: ${lastError.message}`;
          }
        }
        
        console.error("❌ Failed to get recommendations:", errorMsg);
        console.error("🔍 Debugging info:", {
          triedUrls: backendUrls,
          lastError: lastError?.message,
          responseStatus: response?.status,
          responseStatusText: response?.statusText
        });
        
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("💥 Error in callRecommendAPI:", error);
      
      // Re-throw with more context if it's not already our custom error
      if (error.message.includes('HTTP') || error.message.includes('Network') || error.message.includes('timeout')) {
        throw error;
      } else {
        throw new Error(`Unexpected error: ${error.message}`);
      }
    }
  };

  const goNext = () => {
    console.log(`goNext called, current step: ${step}, total steps: ${totalSteps}`);
    if (step < totalSteps - 1) {
      console.log("Moving to next step");
      setStep(step + 1);
    } else {
      console.log("Last step reached, calling handleSubmit");
      handleSubmit();
    }
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

              <Text style={[styles.label, styles.mt]}>ZIP code (for nearby matches)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 02139"
                value={zipCode}
                onChangeText={(t) => setZipCode(t.replace(/[^0-9A-Za-z\- ]/g, ''))}
                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                maxLength={10}
                autoCapitalize="characters"
              />

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
                onPress={() => navigation.navigate("KidQuiz")}
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
              disabled={isSubmitting}
              style={[
                styles.continue, 
                { 
                  paddingVertical: SPACING.sm,
                  opacity: isSubmitting ? 0.6 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              ]}
            >
              {isSubmitting && (
                <ActivityIndicator 
                  size="small" 
                  color="#fff" 
                  style={{ marginRight: 8 }} 
                />
              )}
              <Text style={{ color: "#fff", fontWeight: "800" }}>
                {isSubmitting 
                  ? "AI Creating Your Plan..." 
                  : step === totalSteps - 1 
                    ? "Get My AI Recommendations" 
                    : "Next"
                }
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
