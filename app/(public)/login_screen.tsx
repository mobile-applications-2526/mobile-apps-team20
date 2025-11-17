import AuthFormView from "@/components/auth/auth_form_view";
import { showErrorTop, showMessage } from "@/shared/show_toast_message";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const loginUser = useUserAuthStore((state) => state.requestLoginEmail);
  const authError = useUserAuthStore((state) => state.error);
  const isLoading = useUserAuthStore((state) => state.isLoading);
  const router = useRouter();

  const handleEmailSubmit = async (email: string) => {
    await loginUser(email);
    if (authError) return showErrorTop(`Login failed: ${authError}`);
    router.push("/(public)/verify_email_code_screen");
  };

  return (
    <AuthFormView
      title="Get Started"
      subtitle="Enter your email to log in."
      placeholder="you@example.com"
      submitLabel="Continue with email"
      emptyFieldMessage="Email field is required"
      showGoogleButton={true}
      isLoading={isLoading}
      onSubmit={handleEmailSubmit}
      onGooglePress={() => showMessage("Google sign-in pressed")}
      onSignUpPress={() => router.push("/(public)/register_screen")}
      formLabel="Email"
      keyboardType="email-address"
    />
  );
}

