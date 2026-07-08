import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { COLORS, HABIT_COLORS, FONT, type HabitColor } from "../utils/theme";
import { requestPermission, scheduleDaily, cancelForHabit } from "../services/notifications";
import type { Habit } from "../types";

type Props = {
  editHabit: Habit | null;
  addHabit: (data: Omit<Habit, "id" | "commits">) => void;
  updateHabit: (id: string, data: Partial<Omit<Habit, "id" | "commits">>) => void;
  deleteHabit: (id: string) => void;
  onBack: () => void;
};

const STEPS = ["name", "color", "connector", "reminder"] as const;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

export default function CreateHabitScreen({
  editHabit,
  addHabit,
  updateHabit,
  deleteHabit,
  onBack,
}: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(editHabit?.name ?? "");
  const [color, setColor] = useState<HabitColor>(editHabit?.color ?? HABIT_COLORS[0]);
  const [url, setUrl] = useState(editHabit?.connectorUrl ?? "");
  const [urlError, setUrlError] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(21);
  const [reminderMinute, setReminderMinute] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const isValidUrl = (s: string) => {
    if (!s.trim()) return true;
    try { new URL(s); return true; }
    catch { return false; }
  };

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [step]);

  const next = () => {
    if (step === 0 && !name.trim()) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    if (!isValidUrl(url)) {
      setUrlError("Invalid URL — must start with https://");
      return;
    }
    setUrlError("");
    const data = { name: name.trim(), color, connectorUrl: url.trim() };
    const habitId = editHabit?.id ?? Date.now().toString();

    if (editHabit) {
      updateHabit(editHabit.id, data);
    } else {
      addHabit(data);
    }

    if (reminderEnabled) {
      const granted = await requestPermission();
      if (granted) {
        await scheduleDaily(habitId, name.trim(), reminderHour, reminderMinute);
      } else {
        Alert.alert("Permission denied", "Enable notifications in device settings to use reminders.");
      }
    } else if (editHabit) {
      await cancelForHabit(editHabit.id);
    }

    onBack();
  };

  const confirmDelete = () => {
    Alert.alert(
      "Remove habit",
      `Are you sure you want to remove "${editHabit?.name}"? All history will be lost.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await deleteHabit(editHabit?.id ?? "");
            onBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <TouchableOpacity onPress={onBack} style={styles.back}>
            <Text style={[styles.backText, { fontFamily: FONT.regular }]}>← voltar</Text>
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={[styles.titleSub, { fontFamily: FONT.regular }]}>
              ❯ {editHabit ? "git habit --edit" : "git habit --new"}
            </Text>
            <Text style={[styles.title, { fontFamily: FONT.bold }]}>
              {editHabit ? "edit habit" : "new habit"}
            </Text>
          </View>

          {/* Step 0: Name */}
          <View style={styles.stepBlock}>
            <Text style={[styles.stepLabel, { fontFamily: FONT.regular }]}>❯ habit name</Text>
            {step === 0 ? (
              <>
                <TextInput
                  ref={inputRef}
                  value={name}
                  onChangeText={setName}
                  onSubmitEditing={next}
                  placeholder="ex: ler, exercício, meditação..."
                  placeholderTextColor={COLORS.textGhost}
                  returnKeyType="next"
                  autoCapitalize="none"
                  style={[styles.input, { borderColor: color.mid, fontFamily: FONT.regular }]}
                />
                <TouchableOpacity
                  style={[styles.continueBtn, { opacity: name.trim() ? 1 : 0.4 }]}
                  onPress={next}
                  disabled={!name.trim()}
                >
                  <Text style={[styles.continueBtnText, { fontFamily: FONT.regular }]}>
                    continuar →
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[styles.doneValue, { fontFamily: FONT.regular }]}>{name}</Text>
            )}
          </View>

          {/* Step 1: Color */}
          {step >= 1 && (
            <View style={styles.stepBlock}>
              <Text style={[styles.stepLabel, { fontFamily: FONT.regular }]}>❯ escolha uma cor</Text>
              <View style={styles.colorRow}>
                {HABIT_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c.name}
                    onPress={() => {
                      setColor(c);
                      if (step === 1) setTimeout(() => setStep(2), 200);
                    }}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: c.mid },
                      color.name === c.name && styles.colorSwatchSelected,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Step 2: Connector */}
          {step >= 2 && (
            <View style={styles.stepBlock}>
              <Text style={[styles.stepLabel, { fontFamily: FONT.regular }]}>
                ❯ conector{" "}
                <Text style={{ color: COLORS.border }}>(opcional)</Text>
              </Text>
              <Text style={[styles.stepHint, { fontFamily: FONT.regular }]}>
                URL que retorna o contrato JSON de commits
              </Text>
              <TextInput
                ref={step === 2 ? inputRef : undefined}
                value={url}
                onChangeText={(t) => { setUrl(t); setUrlError(""); }}
                onSubmitEditing={next}
                placeholder="https://meu-script.vercel.app/commits"
                placeholderTextColor={COLORS.textGhost}
                returnKeyType="next"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={[styles.input, { borderColor: urlError ? COLORS.danger : color.mid, fontFamily: FONT.regular }]}
              />
              {urlError ? (
                <Text style={[styles.errorText, { fontFamily: FONT.regular }]}>{urlError}</Text>
              ) : null}
              {step === 2 && (
                <TouchableOpacity
                  style={[styles.continueBtn, { opacity: 1 }]}
                  onPress={next}
                >
                  <Text style={[styles.continueBtnText, { fontFamily: FONT.regular }]}>continuar →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Step 3: Reminder */}
          {step >= 3 && (
            <View style={styles.stepBlock}>
              <Text style={[styles.stepLabel, { fontFamily: FONT.regular }]}>
                ❯ lembrete diário{" "}
                <Text style={{ color: COLORS.border }}>(opcional)</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setReminderEnabled((v) => !v)}
                style={styles.toggleRow}
              >
                <View style={[styles.toggle, reminderEnabled && { backgroundColor: color.mid }]}>
                  <View style={[styles.toggleThumb, reminderEnabled && styles.toggleThumbOn]} />
                </View>
                <Text style={[styles.stepHint, { fontFamily: FONT.regular, marginBottom: 0 }]}>
                  {reminderEnabled ? "ativado" : "desativado"}
                </Text>
              </TouchableOpacity>

              {reminderEnabled && (
                <View style={styles.timeRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                    {HOURS.map((h) => (
                      <TouchableOpacity
                        key={h}
                        onPress={() => setReminderHour(h)}
                        style={[styles.timeChip, reminderHour === h && { backgroundColor: color.mid }]}
                      >
                        <Text style={[styles.timeChipText, { fontFamily: FONT.regular }]}>
                          {String(h).padStart(2, "0")}h
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <View style={styles.minuteRow}>
                    {MINUTES.map((m) => (
                      <TouchableOpacity
                        key={m}
                        onPress={() => setReminderMinute(m)}
                        style={[styles.timeChip, reminderMinute === m && { backgroundColor: color.mid }]}
                      >
                        <Text style={[styles.timeChipText, { fontFamily: FONT.regular }]}>
                          :{String(m).padStart(2, "0")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.commitBtn, { backgroundColor: color.mid, marginTop: 20 }]}
                onPress={finish}
                activeOpacity={0.8}
              >
                <Text style={[styles.commitBtnText, { fontFamily: FONT.bold }]}>
                  {editHabit ? "save" : "create"}
                </Text>
              </TouchableOpacity>

              {editHabit && (
                <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                  <Text style={[styles.deleteBtnText, { fontFamily: FONT.regular }]}>
                    remove
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Progress */}
          <View style={styles.progress}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressBar,
                  { backgroundColor: i <= step ? color.mid : COLORS.border },
                ]}
              />
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  back: { marginBottom: 24 },
  backText: { color: COLORS.textMuted, fontSize: 13 },
  titleBlock: { marginBottom: 32 },
  titleSub: { color: COLORS.textMuted, fontSize: 11, marginBottom: 4 },
  title: { color: COLORS.text, fontSize: 22, letterSpacing: -0.5 },
  stepBlock: { marginBottom: 28 },
  stepLabel: { color: COLORS.textMuted, fontSize: 11, marginBottom: 10 },
  stepHint: { color: COLORS.textDim, fontSize: 11, marginBottom: 8 },
  doneValue: { color: COLORS.textDim, fontSize: 14 },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderRadius: 8,
    color: COLORS.text,
    fontSize: 14,
    padding: 12,
    marginBottom: 12,
  },
  continueBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderMid,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 20,
  },
  continueBtnText: { color: COLORS.text, fontSize: 13 },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchSelected: {
    borderColor: COLORS.text,
    transform: [{ scale: 1.15 }],
  },
  commitBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  commitBtnText: { color: "#fff", fontSize: 14 },
  deleteBtn: { padding: 12, alignItems: "center" },
  deleteBtnText: { color: COLORS.danger, fontSize: 13 },
  errorText: { color: COLORS.danger, fontSize: 11, marginBottom: 8 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.textGhost,
  },
  toggleThumbOn: {
    alignSelf: "flex-end",
    backgroundColor: "#fff",
  },
  timeRow: { gap: 8 },
  minuteRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 4,
  },
  timeChipText: { color: COLORS.text, fontSize: 11 },
  progress: { flexDirection: "row", gap: 6, marginTop: 32 },
  progressBar: { flex: 1, height: 2, borderRadius: 2 },
});
