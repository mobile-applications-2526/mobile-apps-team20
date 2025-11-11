import React, { useMemo, useState } from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  formLabel?: string;
  placeholder?: string;
  submitLabel?: string;
  onEmptyFormSubmitedMessage?: string;
  keyboardType?: KeyboardTypeOptions;
  labelSpacing?: number;           
  onFormSubmit: (content: string) => void;
  loading?: boolean;
  renderLoading: () => React.ReactNode;  // Custom loading
};

export default function SingleLabelForm({
  formLabel = "",
  submitLabel = "Submit",
  placeholder = "",
  keyboardType = "default",
  onEmptyFormSubmitedMessage = "Please fill in all required fields.",
  labelSpacing = 2,
  onFormSubmit,
  loading,
  renderLoading,
}: Props) {
  const [content, setContent] = useState("");
  const [touched, setTouched] = useState(false);

  const error = useMemo(() => {
    if (!touched) return "";
    if (!content.trim()) return onEmptyFormSubmitedMessage;
    if (keyboardType !== "email-address") return "";
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(content.trim())) {
      return `Please enter a valid ${formLabel || "email"} address.`;
    }
    return "";
  }, [content, touched, keyboardType, formLabel, onEmptyFormSubmitedMessage]);

  const isValid = !error && content.trim().length > 0;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    onFormSubmit(content.trim());
  };

  return (
    <View>
      {/* Label (pegado al input) */}
      {!!formLabel && (
        <Text style={[styles.label, { marginBottom: labelSpacing }]}>{formLabel}</Text>
      )}

      {/* Input */}
      <View style={[styles.inputWrap, touched && !!error && styles.inputWrapError]}>
        <TextInput
          value={content}
          onChangeText={setContent}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          placeholderTextColor="#9aa3af"
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={keyboardType === "email-address" ? "email" : "off"}
          textContentType={keyboardType === "email-address" ? "emailAddress" : "none"}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </View>

      {/* Error */}
      {touched && !!error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        activeOpacity={0.9}
        disabled={!isValid || loading}
        style={[styles.continueBtn, !isValid && styles.continueBtnDisabled]}
      >
        {loading ? (
          <>
            {renderLoading()}
          </>
        ) : (
          <>
            <Text style={styles.continueText}>{submitLabel}</Text>
          </>
  )} 

        
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  inputWrapError: {
    borderColor: "#ef4444",
  },
  input: {
    fontSize: 16,
    color: "#111827",
  },
  errorText: {
    marginTop: 4,            // ⬅️ pequeño respiro sin solaparse
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
