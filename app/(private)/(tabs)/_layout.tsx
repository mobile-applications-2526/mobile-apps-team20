// app/(private)/_layout.tsx
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


export default function PrivateLayout() {
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
