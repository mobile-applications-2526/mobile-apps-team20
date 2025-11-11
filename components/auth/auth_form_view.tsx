import React from "react";
import {
  ActivityIndicator,
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import SingleLabelForm from "@/components/shared/single_label_form";

interface AuthFormViewProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  submitLabel?: string;
  emptyFieldMessage?: string;
  showGoogleButton?: boolean;
  showFooter?: boolean;              
  isLoading?: boolean;
  onSubmit: (email: string) => void;
  onGooglePress?: () => void;
  onSignUpPress?: () => void;
  formLabel?: string;
  keyboardType?: KeyboardTypeOptions;
}

export default function AuthFormView({
  title = "Get Started",
  subtitle = "Enter your email to log in.",
  placeholder = "example@email.com",
  submitLabel = "Continue with email",
  emptyFieldMessage = "Email field is required",
  showGoogleButton = true,
  showFooter = true,                
  isLoading = false,
  onSubmit,
  onGooglePress,
  onSignUpPress,
  formLabel = "",
  keyboardType = "default",
}: AuthFormViewProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* Google Button (optional) */}
      {showGoogleButton && (
        <>
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={onGooglePress}
            activeOpacity={0.9}
          >
            <AntDesign name="google" size={20} color={"#2e64e5"} />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerWrap}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
        </>
      )}

      {/* Single Form */}
      <SingleLabelForm
        onFormSubmit={onSubmit}
        formLabel={formLabel}
        placeholder={placeholder}
        keyboardType={keyboardType}
        onEmptyFormSubmitedMessage={emptyFieldMessage}
        submitLabel={submitLabel}
        loading={isLoading}
        renderLoading={() => (
          <View>
            <ActivityIndicator color={"#fff"} />
          </View>
        )}
      />

      {/* Footer (optional) */}
      {showFooter && (
        <View style={styles.footerWrap}>
          <Text style={styles.footerText}>Don’t have an account? </Text>
          <TouchableOpacity onPress={onSignUpPress}>
            <Text style={styles.linkButton}>Sign up</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 150,
    gap: 30,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#111827",
    marginTop: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 8,
    textAlign: "center",
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
    color: "#2e64e5",
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
  footerWrap: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  linkButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e64e5",
    textDecorationLine: "underline",
  },
});
