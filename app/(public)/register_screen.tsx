import AuthFormView from "@/components/auth/auth_form_view";
import { showErrorTop, showMessageTop } from "@/shared/show_toast_message";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { useRouter } from "expo-router";
import React from "react";

export default function RegisterScreen() {

  const registerUser = useUserAuthStore((state) => state.register);
  const authError = useUserAuthStore((state) => state.error);
  const isLoading = useUserAuthStore((state) => state.isLoading);
  const router = useRouter();
  

  const handleEmailSubmit = async (email: string) => {
    await registerUser(email);
    if (authError) {
      showErrorTop(`Register failed: ${authError}`);
      return
    }
    showMessageTop("Please check your inbox to activate your account.")
  }

  return (
      <AuthFormView
        title="Register an Account"
        subtitle="Enter your email."
        placeholder="you@example.com"
        submitLabel="Continue with registration"
        emptyFieldMessage="Email field is required"
        showGoogleButton={false}
        isLoading={isLoading}
        onSubmit={handleEmailSubmit}
        onGooglePress={() => router.push("/verify_email_code_screen")}
        showFooter={false}
        formLabel="Email"
        keyboardType="email-address"
      />
    )
}