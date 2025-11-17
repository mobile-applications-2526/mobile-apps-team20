import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { AuthStatus } from "@/domain/model/enums/AuthStatus";

function FullscreenLoader() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function Index() {
  const authStatus = useUserAuthStore((s) => s.authStatus);
  const isLoading  = useUserAuthStore((s) => s.isLoading);

  // While we’re checking the session or performing an auth call, show a loader
  if (isLoading || authStatus === AuthStatus.CHECKING) {
    return <FullscreenLoader />;
  }

  // Route to the correct group based on the final auth state
  return authStatus === AuthStatus.AUTHENTICATED
    ? <Redirect href="/(private)/discover_screen" />
    : <Redirect href="/(public)/login_screen" />;
}
