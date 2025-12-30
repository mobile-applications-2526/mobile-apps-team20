import { InterestTag } from "@/domain/model/enums/interest_tag";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { useUserProfileStore } from "@/store/user/use_user_profile_store";
import { useEffect, useState } from "react";

export const useProfilePage = () => {
  const user = useUserAuthStore((state) => state.user);
  const logout = useUserAuthStore((state) => state.logout);

  const { profile, isLoading, error, fetchProfile, updateProfile, clearProfile } =
    useUserProfileStore();

  // Track which username the current profile belongs to
  const [lastProfileOwner, setLastProfileOwner] = useState<string | null>(null);

  const usernameKey = user?.username || user?.email || null;

  useEffect(() => {
    if (!usernameKey) return;

    // When the logged-in user changes, clear any previous profile and fetch a new one
    if (lastProfileOwner !== usernameKey) {
      setLastProfileOwner(usernameKey);
      clearProfile();
      fetchProfile();
    }
  }, [usernameKey, lastProfileOwner, clearProfile, fetchProfile]);

  const displayName =
    profile?.name || user?.username || user?.email || "Your Name";

  let subtitle = "Add your location";
  if (profile) {
    if (profile.city || profile.country) {
      subtitle = [profile.city, profile.country].filter(Boolean).join(", ");
    } else if (profile.nationality.length > 0) {
      subtitle = profile.nationality.join(", ");
    }
  }

  const interests =
    profile?.interests && profile.interests.length > 0
      ? profile.interests
      : ["Add your interests"]; 

  const languagesText =
    profile && profile.languages.length > 0
      ? profile.languages.join(", ")
      : "Add your languages";

  const nationalityText =
    profile && profile.nationality.length > 0
      ? profile.nationality.join(", ")
      : "Add your nationality";

  const bioText =
    profile && profile.bio && profile.bio.trim().length > 0
      ? profile.bio
      : "Tell others a bit about yourself.";

  // --- Edit form state ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUserName, setEditUserName] = useState(profile?.name ?? "");
  const [editNationality, setEditNationality] = useState<string[]>(
    profile?.nationality ?? []
  );
  const [editLanguages, setEditLanguages] = useState<string[]>(
    profile?.languages ?? []
  );
  const [editAge, setEditAge] = useState(
    profile?.age ? String(profile.age) : ""
  );
  const [editCity, setEditCity] = useState(profile?.city ?? "");
  const [editCountry, setEditCountry] = useState(profile?.country ?? "");
  const [editInterests, setEditInterests] = useState(
    profile?.interests.join(", ") ?? ""
  );
  const [editBio, setEditBio] = useState(profile?.bio ?? "");

  useEffect(() => {
    if (profile) {
      setEditUserName(profile.name ?? "");
      setEditNationality(profile.nationality ?? []);
      setEditLanguages(profile.languages ?? []);
      setEditAge(profile.age ? String(profile.age) : "");
      setEditCity(profile.city ?? "");
      setEditCountry(profile.country ?? "");
      setEditInterests(profile.interests.join(", ") ?? "");
      setEditBio(profile.bio ?? "");
    }
  }, [profile]);

  const handleEditProfile = () => {
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
  };

  const handleSubmitEdit = async () => {
    const languages = editLanguages;

    // Trim trailing/leading spaces from username to avoid mismatches
    const safeUserName = editUserName.trim();

    const nationalityString = editNationality.join(", ");

    const interests = editInterests
      .split(",")
      .map((i) => i.trim().toUpperCase())
      .filter(Boolean) as InterestTag[];

    const ageNumber = Number(editAge) || 0;

    await updateProfile({
      userName: safeUserName,
      nationality: nationalityString,
      languages,
      age: ageNumber,
      interests,
      bio: editBio,
      userLocation: { city: editCity, country: editCountry },
      profilePicture: null,
    });

    setIsEditOpen(false);
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
    // edit state & actions
    isEditOpen,
    editUserName,
    editNationality,
    editLanguages,
    editAge,
    editCity,
    editCountry,
    editInterests,
    editBio,
    setEditUserName,
    setEditNationality,
    setEditLanguages,
    setEditAge,
    setEditCity,
    setEditCountry,
    setEditInterests,
     setEditBio,
    handleCloseEdit,
    handleSubmitEdit,
    languagesText,
    nationalityText,
    bioText,
    handleEditProfile,
    handleLogout,
  };
};

