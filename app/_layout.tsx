// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { RootSiblingParent } from 'react-native-root-siblings'; // needed for root toasts
import 'react-native-reanimated';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { AuthStatus } from "@/domain/model/enums/AuthStatus";

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const colorScheme   = useColorScheme();
  const refreshToken  = useUserAuthStore((s) => s.refreshToken);
  const setAuthStatus = useUserAuthStore((s) => s.setAuthStatus);

  useEffect(() => {
    (async () => {
      // If we find a refresh token, try a silent session refresh on launch
      const rt = await AsyncStorage.getItem("refreshToken");
      if (rt) {
        // Mark as checking to block public/private layouts until we know the result
        setAuthStatus(AuthStatus.CHECKING);
        await refreshToken();
      }
    })();
  }, []);

  return (
    <RootSiblingParent>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </RootSiblingParent>
  );
}
