// app/(private)/_layout.tsx
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { AuthStatus } from "@/domain/model/enums/AuthStatus";

function FullscreenLoader() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function PrivateLayout() {
  const authStatus = useUserAuthStore((s) => s.authStatus);
  const isLoading  = useUserAuthStore((s) => s.isLoading);

  // Block rendering while auth is being checked to avoid flicker
  if (isLoading || authStatus === AuthStatus.CHECKING) {
    return <FullscreenLoader />;
  }

  // If the user is not authenticated, kick them to the public group
  if (authStatus !== AuthStatus.AUTHENTICATED) {
    return <Redirect href="/(public)/login_screen" />;
  }

  // Normal tabs for authenticated users
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2e64e5',
        tabBarStyle: { backgroundColor: '#fefefe', borderTopColor: '#fefefe' },
      }}
    >
      <Tabs.Screen
        name="discover_screen"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="chat_screen"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox-ellipses" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="profile_screen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          )
        }}
      />
    </Tabs>
  );
}
