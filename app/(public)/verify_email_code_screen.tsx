import AuthFormView from "@/components/auth/auth_form_view";
import { showErrorTop } from "@/shared/utils/show_toast_message";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { useRouter } from "expo-router";
import React from "react";


export default function VerifyEmailCodeScreen() {

  const verifyEmailCode = useUserAuthStore((state) => state.verifyEmailCode);
  const isLoading = useUserAuthStore((state) => state.isLoadingCode);
  const router = useRouter()
  

  const handleCodeSubmit = async (code: string) => {
    const success = await verifyEmailCode(code);

    if (!success) {
      const error = useUserAuthStore.getState().errorCode
      return showErrorTop(`Verification code failed: ${error}`);
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
