// app/(public)/_layout.tsx
import { AuthStatus } from "@/domain/model/enums/AuthStatus";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { Redirect, Stack } from "expo-router";

export default function PublicLayout() {
  //skips login in dev mode
  if (__DEV__) {
    return <Redirect href="/(private)/discover_screen" />;
  }

  const authStatus = useUserAuthStore((s) => s.authStatus);
<<<<<<< HEAD
=======
  const isLoading  = useUserAuthStore((s) => s.isLoading);


  // Avoid flashing login/register while we’re still checking auth
  if (isLoading && authStatus === AuthStatus.CHECKING) {
    return <FullscreenLoader />;
  }
>>>>>>> master

  // If user is authenticated, do not allow entering public routes
  if (authStatus === AuthStatus.AUTHENTICATED) {
    return <Redirect href="/(private)/(tabs)/discover_screen" />;
  }

  // Normal public stack
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fff" },
      }}
    >
      <Stack.Screen name="login_screen" />
      <Stack.Screen name="register_screen" />
      <Stack.Screen name="verify_email_code_screen" />
    </Stack>
  );
}
