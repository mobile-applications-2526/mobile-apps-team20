import AuthenticationFormView from "@/components/auth/authentication_form_view";
import { showErrorMessage } from "@/shared/show_error_message";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {

  const loginUser = useUserAuthStore((state) => state.requestLoginEmail);
  const authError = useUserAuthStore((state) => state.error);
  const router = useRouter();

  const handleEmailSubmit = async (email: string) => {
    await loginUser(email);
    if (authError) 
      return showErrorMessage(`Login failed: ${authError}`);
    
    // Navigate to email code verification screen
    //TODO: router.push("/verify_email_code")
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
            Enter your email to log in.
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

          <AuthenticationFormView
            onFormSubmit={handleEmailSubmit}
            formLabel="Email"
            placeholder="example@email.com"
            keyboardType="email-address"
            onEmptyFormSubmitedMessage="Email field is required"
            submitLabel="Continue with email"
          />

          {/* Footer / Sign up prompt */}
            <View style={styles.footerWrap}>
              <Text style={styles.footerText}>
                Don’t have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => {
                  //TODO: Navigate to sign up screen
                }}>
                <Text style={styles.linkButton}>Sign up</Text>
              </TouchableOpacity>
            </View>

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
  footerWrap: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280", // gray-500
  },
  linkButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e64e5", // your primary blue
    textDecorationLine: "underline",
  },
});
