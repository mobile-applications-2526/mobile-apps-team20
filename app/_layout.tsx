// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { RootSiblingParent } from 'react-native-root-siblings'; // needed for root toasts
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';


export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const colorScheme   = useColorScheme();

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
