import { UserProfileUpdateRequest } from "@/domain/model/dto/user/user_profile_update_request";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { useUserProfileStore } from "@/store/user/use_user_profile_store";
import { useEffect, useState } from "react";

export const useProfilePage = () => {
  const user = useUserAuthStore((state) => state.user);
  const logout = useUserAuthStore((state) => state.logout);

  const {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    clearStore,
    clearPublicProfile,
  } = useUserProfileStore();

  // Track which username the current profile belongs to
  const [lastProfileOwner, setLastProfileOwner] = useState<string | null>(
    null
  );

  const usernameKey = user?.username || user?.email || null;

  useEffect(() => {
    if (!usernameKey) return;

    // When the logged-in user changes, clear any previous profile and fetch a new one
    if (lastProfileOwner !== usernameKey) {
      setLastProfileOwner(usernameKey);
      clearPublicProfile();
      fetchProfile();
    }
  }, [usernameKey, lastProfileOwner, clearPublicProfile, fetchProfile]);

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

  // Local URI for a newly selected profile image (for upload)
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

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
    // Discard any unsaved image selection when closing the editor
    setProfileImageUri(null);

    // Optionally reset form fields back to the last saved profile
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

    const payload: UserProfileUpdateRequest = {
      userName: safeUserName,
      nationality: nationalityString,
      languages,
      age: ageNumber,
      interests,
      bio: editBio,
      userLocation: { city: editCity, country: editCountry },
      profilePicture: null,
    };

    // Always send multipart/form-data as required by the backend:
    // - part "data": JSON UserProfileRequest
    // - optional part "image": binary file
    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    if (profileImageUri) {
      const uri = profileImageUri;
      const filename = uri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri,
        name: filename,
        type,
      } as any);
    }

    await updateProfile(formData);

    // Clear the local selection after a successful save so that
    // reopening the editor shows "+ Add picture" until a new
    // image is chosen.
    setProfileImageUri(null);
    setIsEditOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    // Also reset any locally selected profile image on logout
    setProfileImageUri(null);
    clearStore();
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
    profileImageUri,
    setEditUserName,
    setEditNationality,
    setEditLanguages,
    setEditAge,
    setEditCity,
    setEditCountry,
    setEditInterests,
    setEditBio,
    setProfileImageUri,
    handleCloseEdit,
    handleSubmitEdit,
    languagesText,
    nationalityText,
    bioText,
    handleEditProfile,
    handleLogout,
  };
};
