// app/(public)/_layout.tsx
import { AuthStatus } from "@/domain/model/enums/AuthStatus";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

function FullscreenLoader() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function PublicLayout() {
  const authStatus = useUserAuthStore((s) => s.authStatus);
  const isLoading  = useUserAuthStore((s) => s.isLoginLoading);

  // Avoid flashing login/register while we’re still checking auth
  if (isLoading && authStatus === AuthStatus.CHECKING) {
    return <FullscreenLoader />;
  }

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
