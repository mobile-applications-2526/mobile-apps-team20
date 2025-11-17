import AuthFormView from "@/components/auth/auth_form_view";
import { showErrorTop } from "@/shared/show_toast_message";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { useRouter } from "expo-router";
import React from "react";


export default function VerifyEmailCodeScreen() {

  const verifyEmailCode = useUserAuthStore((state) => state.verifyEmailCode);
  const authError = useUserAuthStore((state) => state.error);
  const isLoading = useUserAuthStore((state) => state.isLoading);
  const router = useRouter()
  

  const handleCodeSubmit = async (code: string) => {
    await verifyEmailCode(code);
    if (authError) {
      return showErrorTop(`Error: ${authError}`);
    }
    router.push("/discover_screen")
  }

  return (
      <AuthFormView
        title="Account Verification"
        subtitle="Enter the code sent to your email."
        placeholder="XXXX-XXXX"
        submitLabel="Veritfy Code"
        emptyFieldMessage="Code field is required"
        showGoogleButton={false}
        isLoading={isLoading}
        onSubmit={handleCodeSubmit}
        formLabel="Code"
        keyboardType="number-pad"
      />
    );
}
