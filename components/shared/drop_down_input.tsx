import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

interface DropdownInputProps {
  // Label displayed above the text input
  label: string;
  // Callback triggered when user presses "Apply"
  onSubmit: (data: string) => void;
  // Callback triggered when user presses "Cancel"
  onCancel?: () => void;
}

/**
 * Reusable text input component designed for dropdown filters.
 * It displays a label, an input field, and two actions: Cancel / Apply.
 * The input value is locally managed using internal state.
 */
export default function DropdownInput({ label, onSubmit, onCancel }: DropdownInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => onSubmit(text)
  const handleCancel = () => {
    setText("");
    onCancel?.();
  };

  return (
    <View style={styles.container}>
      {/* Label text */}
      <Text style={styles.label}>{label}</Text>

      {/* Text input field */}
      <TextInput
        style={styles.input}
        placeholder="Type here..."
        placeholderTextColor="#888"
        value={text}
        onChangeText={setText}
      />

      {/* Actions: Cancel / Apply */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, !text.trim() && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!text.trim()}
        >
          <Text style={styles.submitText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    width: 250,
    alignSelf: "flex-end",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#000",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8, // RN 0.71+; si no, usa marginLeft en el botón de Apply
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  cancelText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
