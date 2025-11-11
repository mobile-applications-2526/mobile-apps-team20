// app/(auth)/get_started.tsx (o donde prefieras)
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export default function GetStartedScreen() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const error = useMemo(() => {
    if (!touched) return "";
    if (!email.trim()) return "Email is required.";
    // Simple email pattern for UI validation
    const pattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(email.trim())) return "Enter a valid email address.";
    return "";
  }, [email, touched]);

  const isValid = !error && email.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.container}>
          {/* Header */}
          <Text style={styles.title}>Get Started</Text>
          <Text style={styles.subtitle}>
            Enter your student email to create an account or log in.
          </Text>

          {/* Google Button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => {
              // TODO: handle Google sign-in
            }}
            activeOpacity={0.9}
          >
            <AntDesign name="google" size={20} />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerWrap}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Label */}
          <Text style={styles.label}>Email</Text>

          {/* Email Input */}
          <View
            style={[
              styles.inputWrap,
              touched && !!error && styles.inputWrapError,
            ]}
          >
            <TextInput
              value={email}
              onChangeText={setEmail}
              onBlur={() => setTouched(true)}
              placeholder="firstname.lastname@email.com"
              placeholderTextColor="#9aa3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              returnKeyType="done"
            />
          </View>

          {/* Error Message */}
          {touched && !!error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* Continue Button */}
          <TouchableOpacity
            onPress={() => {
              // TODO: handle email flow (magic link / password)
              // Only proceed if isValid is true
            }}
            activeOpacity={0.9}
            disabled={!isValid}
            style={[styles.continueBtn, !isValid && styles.continueBtnDisabled]}
          >
            <Text style={styles.continueText}>Continue with Email</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>

          {/* Footer / Terms */}
          <Text style={styles.footerText}>
            By continuing, you agree to Finder’s{" "}
            <Text style={styles.link}>Terms of Service</Text> and{" "}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#ffffff" },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
  },
  label: {
    marginTop: 4,
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
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
  footerText: {
    marginTop: 8,
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 18,
  },
  link: {
    color: "#2e64e5",
    textDecorationLine: "underline",
  },
});
