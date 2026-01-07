// app/(private)/_layout.tsx
import { AuthStatus } from "@/domain/model/enums/AuthStatus";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { Redirect, Stack } from "expo-router";



export default function PrivateLayout() {
  const authStatus = useUserAuthStore((s) => s.authStatus);

  // If the user is not authenticated, kick them to the public group
  if (authStatus !== AuthStatus.AUTHENTICATED) {
    return <Redirect href="/(public)/login_screen" />;
  }


  // Normal tabs for authenticated users
  return (
    <Stack>
     <Stack.Screen 
        name="(tabs)"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="event/[id]" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="chat/[id]" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="user/[id]" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}
