import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AuthenticationFormView({
  formLabel = "",
  submitLabel = "Submit",
  placeholder = "",
  keyboardType = "default",
  onEmptyFormSubmitedMessage = "Please fill in all required fields.",
  onFormSubmit,
}: {
  formLabel?: string;
  placeholder?: string;
  submitLabel?: string;
  onEmptyFormSubmitedMessage?: string;
  keyboardType?: KeyboardTypeOptions;
  onFormSubmit: (content: string) => void;
}) {
  const [content, setContent] = useState("");
  const [touched, setTouched] = useState(false);

  // Compute validation errors
  const error = useMemo(() => {
    if (!touched) return "";

    if (!content.trim()) return onEmptyFormSubmitedMessage;

    if (keyboardType !== "email-address") return "";

    // Simple email pattern for basic validation
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(content.trim())) {
      return `Please enter a valid ${formLabel || "email"} address.`;
    }

    return "";
  }, [content, touched, keyboardType, formLabel, onEmptyFormSubmitedMessage]);

  const isValid = !error && content.trim().length > 0;

  return (
    <View>
      {/* Input */}
      <View
        style={[
          styles.inputWrap,
          touched && !!error && styles.inputWrapError,
        ]}
      >
        <TextInput
          value={content}
          onChangeText={setContent}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          placeholderTextColor="#9aa3af"
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          returnKeyType="done"
        />
      </View>

      {/* Error text */}
      {touched && !!error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Submit button */}
      <TouchableOpacity
        onPress={() => {
          setTouched(true);
          if (!isValid) return;
          onFormSubmit(content.trim());
        }}
        activeOpacity={0.9}
        disabled={!isValid}
        style={[
          styles.continueBtn,
          !isValid && styles.continueBtnDisabled,
        ]}
      >
        <Text style={styles.continueText}>{submitLabel}</Text>
        <Ionicons name="arrow-forward" size={18} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputWrapError: {
    borderColor: "#ef4444",
  },
  input: {
    fontSize: 16,
    color: "#111827",
  },
  errorText: {
    marginTop: -2,
    fontSize: 12,
    color: "#ef4444",
  },
  continueBtn: {
    marginTop: 8,
    backgroundColor: "#2e64e5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  continueBtnDisabled: {
    backgroundColor: "#93b0ff",
  },
  continueText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
