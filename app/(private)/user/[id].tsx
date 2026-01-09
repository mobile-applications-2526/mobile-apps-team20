import PublicProfileScreen, { PublicUserProps } from "@/components/user/public_profile_screen";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";
// Import the global store
import { useUserProfileStore } from "@/store/user/use_user_profile_store";

export default function UserProfilePage() {
  // Get dynamic ID from route (e.g., /users/123 -> id = "123")
  const { id } = useLocalSearchParams<{ id: string }>();

  // Use the global store instead of local state
  const { 
    publicProfile, 
    isPublicLoading, 
    error, 
    fetchUserById, 
    clearPublicProfile 
  } = useUserProfileStore();

  useEffect(() => {
    if (id) {
      fetchUserById(id);
    }

    // Cleanup: Clear the public profile from the store when leaving this screen
    // to prevent flashing old data when visiting another user's profile later.
    return () => {
      clearPublicProfile();
    };
  }, [id, fetchUserById, clearPublicProfile]);

  if (isPublicLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  // Handle errors or missing profile data
  if (error || !publicProfile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "User not found"}</Text>
      </View>
    );
  }

  // Data Mapping:
  // Map the Domain Entity (UserProfile) from the store to the UI Component Props (PublicUserProps).
  const userProps: PublicUserProps = {
    username: publicProfile.name,
    profileImage: publicProfile.profileImage ?? null,
    interests: publicProfile.interests || [],
    bio: publicProfile.bio,
    city: publicProfile.city,
    country: publicProfile.country,
    languages: publicProfile.languages ?? [],
    nationality: publicProfile.nationality ?? [],
  };

  return (
    <>
      {/* Configure Header title automatically based on loaded user */}
      <Stack.Screen 
        options={{ 
          title: userProps.username || "Profile",
          headerBackTitle: "Back" // Back button text for iOS
        }} 
      />
      
      {/* Render profile UI with mapped props */}
      <PublicProfileScreen user={userProps} />
    </>
  );
}

const styles = StyleSheet.create({
  // Loading/Error containers
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
  },

  screenContainer: { flex: 1, backgroundColor: "#f9f9f9" },
});