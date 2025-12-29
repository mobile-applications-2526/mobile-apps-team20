import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { useUserProfileStore } from "@/store/user/use_user_profile_store";
import { useEffect } from "react";

export const useProfilePage = () => {
  const user = useUserAuthStore((state) => state.user);
  const logout = useUserAuthStore((state) => state.logout);

  const { profile, isLoading, error, fetchProfile } = useUserProfileStore();

  useEffect(() => {
    if (!profile && !isLoading) {
      fetchProfile();
    }
  }, [profile, isLoading, fetchProfile]);

  const displayName =
    profile?.name || user?.username || user?.email || "Your Name";

  const subtitle =
    profile && (profile.city || profile.country)
      ? [profile.city, profile.country].filter(Boolean).join(", ")
      : profile?.nationality || "Add your location";

  const interests =
    profile?.interests && profile.interests.length > 0
      ? profile.interests
      : ["Add your interests"]; 

  const languagesText =
    profile && profile.languages.length > 0
      ? profile.languages.join(", ")
      : "Add your languages";

  const nationalityText = profile?.nationality || "Add your nationality";

  const bioText = profile
    ? `${displayName}, ${profile.age} years old`
    : "Tell others a bit about yourself.";

  const handleEditProfile = () => {
    // TODO: navigate to edit profile screen when implemented
    console.log("Edit profile pressed");
  };

  const handleLogout = async () => {
    await logout();
  };

  return {
    user,
    profile,
    isLoading,
    error,
    displayName,
    subtitle,
    interests,
    languagesText,
    nationalityText,
    bioText,
    handleEditProfile,
    handleLogout,
  };
};

