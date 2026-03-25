import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { COLORS, FONT } from "../utils/theme";
import { formatDatePtBR, toKey } from "../utils/date";
import type { Habit } from "../types";

type Props = {
  visible: boolean;
  day: Date | null;
  habit: Habit | null;
  onClose: () => void;
  onSave: (dateKey: string, message: string) => void;
  onRemove: (dateKey: string) => void;
};

export default function CommitModal({ visible, day, habit, onClose, onSave, onRemove }: Props) {
  const [msg, setMsg] = useState("");

  const key = day ? toKey(day) : "";
  const existing = key && habit ? habit.commits[key] : null;

  useEffect(() => {
    setMsg(existing?.message ?? "");
  }, [key]);

  if (!day || !habit) return null;

  const fmt = formatDatePtBR(day);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.sheet}
            >
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={[styles.label, { fontFamily: FONT.regular }]}>❯ git commit</Text>
                  <Text style={[styles.date, { fontFamily: FONT.regular }]}>{fmt}</Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={[styles.close, { fontFamily: FONT.regular }]}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Badge */}
              <View style={[styles.badge, { borderColor: habit.color.mid }]}>
                <View style={[styles.badgeDot, { backgroundColor: habit.color.bright }]} />
                <Text style={[styles.badgeName, { color: habit.color.bright, fontFamily: FONT.bold }]}>
                  {habit.name}
                </Text>
              </View>

              {/* Message */}
              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { fontFamily: FONT.regular }]}>
                  ❯ commit message{" "}
                  <Text style={{ color: COLORS.border }}>(opcional)</Text>
                </Text>
                <TextInput
                  value={msg}
                  onChangeText={setMsg}
                  placeholder="descreva seu commit..."
                  placeholderTextColor={COLORS.textGhost}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.input,
                    { fontFamily: FONT.regular, borderColor: habit.color.mid },
                  ]}
                />
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {existing?.committed && (
                  <TouchableOpacity
                    style={styles.btnRemove}
                    onPress={() => { onRemove(key); onClose(); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.btnRemoveText, { fontFamily: FONT.semiBold }]}>
                      remover
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.btnCommit,
                    { backgroundColor: habit.color.mid, flex: existing?.committed ? 2 : 1 },
                  ]}
                  onPress={() => { onSave(key, msg); onClose(); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.btnCommitText, { fontFamily: FONT.bold }]}>
                    {existing?.committed ? "edit" : "❯ commit"}
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000000cc",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderMid,
    borderBottomWidth: 0,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  label: { color: COLORS.textMuted, fontSize: 11 },
  date: { color: COLORS.text, fontSize: 13, marginTop: 2 },
  close: { color: COLORS.textMuted, fontSize: 24, lineHeight: 24 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeName: { fontSize: 12 },
  inputSection: { marginBottom: 16 },
  inputLabel: { color: COLORS.textMuted, fontSize: 11, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderRadius: 8,
    color: COLORS.text,
    fontSize: 13,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  actions: { flexDirection: "row", gap: 8 },
  btnRemove: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderMid,
    borderRadius: 8,
    alignItems: "center",
  },
  btnRemoveText: { color: COLORS.danger, fontSize: 13 },
  btnCommit: { padding: 12, borderRadius: 8, alignItems: "center" },
  btnCommitText: { color: "#fff", fontSize: 13 },
});
