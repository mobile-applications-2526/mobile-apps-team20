import AuthenticationFormView from "@/components/auth/authentication_form_view";
import { showErrorMessage } from "@/shared/show_error_message";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import React from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function LoginScreen() {

  const verifyEmailCode = useUserAuthStore((state) => state.verifyEmailCode);
  const authError = useUserAuthStore((state) => state.error);

  const handleEmailSubmit = async (code: string) => {
    await verifyEmailCode(code);
    if (authError) 
      return showErrorMessage(`Error: ${authError}`);
    // TODO: Navigate to main app screen after successful registration
  }

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
            Enter your email to register an account.
          </Text>

          {/* Email Label */}
          <Text style={styles.label}>Email</Text>

          <AuthenticationFormView
            onFormSubmit={handleEmailSubmit}
            formLabel="Email"
            placeholder="example@email.com"
            keyboardType="email-address"
            onEmptyFormSubmitedMessage="Email field is required"
            submitLabel="Continue with registration"
          />

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
  label: {
    marginTop: 4,
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },  
});
