import { countries } from "countries-list";
import ISO6391 from "iso-639-1";
import React, { useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Custom Hooks
import { useProfilePage } from "@/hooks/user/use_profile_page";

// Components
import { InterestSelector } from "@/components/shared/interest_selector";
import { Section } from "@/components/shared/section"; // Adjust path
import { File } from "lucide-react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

export default function ProfileScreen() {
  const {
    user,
    profile,
    displayName,
    subtitle,
    interests,
    error,
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
    setEditInterests, // This updates the string in the store/hook
    setEditBio,
    setProfileImageUri,
    handleCloseEdit,
    handleSubmitEdit,
    languagesText,
    nationalityText,
    bioText,
    handleEditProfile,
    handleLogout,
  } = useProfilePage();

  const initial = displayName.charAt(0).toUpperCase();
  const remoteProfileImage = profile?.profileImage ?? null;
  // Main avatar should always reflect the last saved image from backend
  const avatarUri = remoteProfileImage;
  // Preview inside the edit modal only shows a newly selected (unsaved) image
  const previewUri = profileImageUri;

  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false);
  const [isNationalityPickerOpen, setIsNationalityPickerOpen] = useState(false);

  const handlePickProfileImage = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.8,
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          // Simple silent fail; could be improved with a toast
          console.warn("Profile image pick error", response.errorMessage);
          return;
        }
        const asset = response.assets && response.assets[0];
        if (!asset?.uri) return;
        setProfileImageUri(asset.uri);
      }
    );
  };

  const handleTakeProfilePhoto = () => {
    launchCamera(
      {
        mediaType: "photo",
        quality: 0.8,
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.warn("Profile camera error", response.errorMessage);
          return;
        }
        const asset = response.assets && response.assets[0];
        if (!asset?.uri) return;
        setProfileImageUri(asset.uri);
      }
    );
  };

  // Handle hardware back button on Android when modal is open
  useEffect(() => {
    const onBackPress = () => {
      if (isEditOpen) {
        handleCloseEdit();
        return true; 
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, [isEditOpen, handleCloseEdit]);

  // Memoize static data
  const languageOptions = useMemo(
    () =>
      ISO6391.getAllCodes()
        .map((code) => ({ code, name: ISO6391.getName(code) }))
        .filter((l) => l.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const nationalityOptions = useMemo(() => {
    const list = Object.values(countries)
      .map((c) => c.name)
      .filter((n): n is string => !!n && n.trim().length > 0);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, []);

  return (
    <View style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {error ? (
          <Text style={styles.errorText}>
            Could not load your profile: {error}
          </Text>
        ) : null}

        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Interests</Text>
        <View style={styles.chipsRow}>
          {interests.map((tag) => (
            <View key={tag} style={styles.chip}>
              <Text style={styles.chipText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Section title="Bio" defaultOpen={false}>
          <Text>{bioText}</Text>
        </Section>

        <Section title="Languages" defaultOpen={false}>
          <Text>{languagesText}</Text>
        </Section>

        <Section title="Nationality" defaultOpen={false}>
          <Text>{nationalityText}</Text>
        </Section>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditOpen}
        animationType="slide"
        transparent
        onRequestClose={handleCloseEdit}
      >
        <KeyboardAvoidingView
          style={styles.editOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <View style={styles.editContainer}>
            <Text style={styles.editTitle}>Edit Profile</Text>
            <ScrollView
              style={styles.editScroll}
              contentContainerStyle={styles.editScrollContent}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={!isLanguagePickerOpen && !isNationalityPickerOpen}
            >
              <Text style={styles.fieldLabel}>Profile picture</Text>
              <View style={styles.profileImageRow}>
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={handlePickProfileImage}
                >
                  {previewUri ? (
                    <Image
                      source={{ uri: previewUri }}
                      style={styles.profileImagePreview}
                    />
                  ) : (
                    <View style={styles.imagePickerContent}>
                      <File size={18} color="#9ca3af" style={{ marginRight: 8 }} />
                      <Text style={styles.imagePickerText}>Choose from files</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleTakeProfilePhoto}
                >
                  <Text style={styles.cameraButtonText}>Take a picture</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={editUserName}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\s+$/g, "");
                  setEditUserName(cleaned);
                }}
              />

              {/* Nationality Dropdown */}
              <Text style={styles.fieldLabel}>Nationality</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setIsNationalityPickerOpen((prev) => !prev)}
              >
                <Text
                  style={{
                    color: editNationality.length ? "#000" : "#9ca3af",
                  }}
                >
                  {editNationality.length
                    ? editNationality.join(", ")
                    : "Select your nationality"}
                </Text>
              </TouchableOpacity>

              {isNationalityPickerOpen && (
                <View style={styles.languageListContainer}>
                  <ScrollView
                    style={styles.languageList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {nationalityOptions.map((nat) => {
                      const selected = editNationality.includes(nat);
                      return (
                        <TouchableOpacity
                          key={nat}
                          style={[
                            styles.languageItem,
                            selected && styles.languageItemSelected,
                          ]}
                          onPress={() => {
                            setEditNationality((prev) =>
                              prev.includes(nat)
                                ? prev.filter((n) => n !== nat)
                                : [...prev, nat]
                            );
                          }}
                        >
                          <Text style={styles.languageItemLabel}>{nat}</Text>
                          {selected && (
                            <Text style={styles.languageItemCheck}>✓</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Languages Dropdown */}
              <Text style={styles.fieldLabel}>Languages</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setIsLanguagePickerOpen((prev) => !prev)}
              >
                <Text style={{ color: editLanguages.length ? "#000" : "#9ca3af" }}>
                  {editLanguages.length
                    ? editLanguages.join(", ")
                    : "Select your languages"}
                </Text>
              </TouchableOpacity>

              {isLanguagePickerOpen && (
                <View style={styles.languageListContainer}>
                  <ScrollView
                    style={styles.languageList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {languageOptions.map((lang) => {
                      const selected = editLanguages.includes(lang.name);
                      return (
                        <TouchableOpacity
                          key={lang.code}
                          style={[
                            styles.languageItem,
                            selected && styles.languageItemSelected,
                          ]}
                          onPress={() => {
                            setEditLanguages((prev) =>
                              prev.includes(lang.name)
                                ? prev.filter((l) => l !== lang.name)
                                : [...prev, lang.name]
                            );
                          }}
                        >
                          <Text style={styles.languageItemLabel}>{lang.name}</Text>
                          {selected && <Text style={styles.languageItemCheck}>✓</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.fieldLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                keyboardType="numeric"
                value={editAge}
                onChangeText={setEditAge}
              />

              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={editCity}
                onChangeText={setEditCity}
              />

              <Text style={styles.fieldLabel}>Country</Text>
              <TextInput
                style={styles.input}
                placeholder="Country"
                value={editCountry}
                onChangeText={setEditCountry}
              />

              <Text style={styles.fieldLabel}>Interests</Text>
              {/* Using the new separate component */}
              <InterestSelector
                selectedInterestsString={editInterests}
                onSelectionChange={setEditInterests}
              />

              <Text style={styles.fieldLabel}>Bio</Text>
              <TextInput
                style={styles.bioInput}
                placeholder="Tell others a bit about yourself"
                value={editBio}
                onChangeText={setEditBio}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.editFooter}>
              <View style={styles.editButtonsRow}>
                <TouchableOpacity
                  style={[styles.editButton, styles.editCancelButton]}
                  onPress={handleCloseEdit}
                >
                  <Text style={styles.editButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, styles.editSaveButton]}
                  onPress={handleSubmitEdit}
                >
                  <Text style={[styles.editButtonText, styles.editSaveButtonText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#f9f9f9" },
  container: { padding: 20, paddingBottom: 40 },
  name: {
    fontSize: 28,
    fontWeight: "600",
    marginTop: 24,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 24,
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#0066cc",
    marginRight: 8,
  },
  buttonText: { textAlign: "center", color: "#fff" },
  label: { fontWeight: "600", marginTop: 8, marginBottom: 8 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e3edf7",
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { color: "#0066cc" },
  avatarWrapper: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff",
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#d9534f",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  editOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  editContainer: {
    width: "100%",
    height: "75%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  languageListContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  languageList: {
    paddingVertical: 4,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  languageItemSelected: {
    backgroundColor: "#e3edf7",
  },
  languageItemLabel: {
    color: "#111827",
  },
  languageItemCheck: {
    color: "#0066cc",
    fontWeight: "600",
  },
  bioInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    minHeight: 80,
  },
  profileImageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  imagePickerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  imagePicker: {
    flex: 1,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    overflow: "hidden",
  },
  imagePickerText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
  },
  profileImagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cameraButton: {
    flex: 1,
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0066cc",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButtonText: {
    color: "#0066cc",
    fontWeight: "600",
  },
  editScroll: {
    flex: 1,
  },
  editScrollContent: {
    paddingBottom: 16,
  },
  editFooter: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  editButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  editCancelButton: {
    backgroundColor: "#e5e7eb",
  },
  editSaveButton: {
    backgroundColor: "#0066cc",
  },
  editButtonText: {
    color: "#111827",
    fontWeight: "600",
    textAlign: "center",
  },
  editSaveButtonText: {
    color: "#ffffff",
  },
});