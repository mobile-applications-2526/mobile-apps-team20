import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

// Interfaz para los datos que esperamos recibir
export interface PublicUserProps {
  username?: string;
  profileImage?: string | null;
  interests: string[];
  bio?: string;
  languages?: string[];
  nationality?: string[];
  city?: string;
  country?: string;
}

// Sub-componente para las secciones
const ReadOnlySection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  if (!children) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
};

export default function PublicProfileScreen({ user }: { user: PublicUserProps }) {
  const initial = user.username ? user.username.charAt(0).toUpperCase() : "?";
  const locationText = [user.city, user.country].filter(Boolean).join(", ");

  // Helper para verificar arrays vacíos y formatearlos
  const formatArrayData = (data?: string[]) => {
    if (data && data.length > 0) {
      return data.join(", "); // "English, Spanish"
    }
    return "Not specified";
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Avatar Area */}
        <View style={styles.avatarWrapper}>
          {user.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
        </View>

        {/* Basic Info */}
        <Text style={styles.name}>{user.username ?? "User"}</Text>
        {locationText ? <Text style={styles.location}>{locationText}</Text> : null}

        {/* Interests Chips (Solo se muestra si hay intereses) */}
        {user.interests && user.interests.length > 0 && (
          <>
            <Text style={styles.label}>Interests</Text>
            <View style={styles.chipsRow}>
              {user.interests.map((tag) => (
                <View key={tag} style={styles.chip}>
                  <Text style={styles.chipText}>{tag}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Bio */}
        <ReadOnlySection title="Bio">
          <Text style={styles.bodyText}>
            {user.bio && user.bio.trim() !== "" 
              ? user.bio 
              : "This user hasn't written a bio yet."}
          </Text>
        </ReadOnlySection>

        {/* Languages - AQUI ESTABA EL ERROR */}
        <ReadOnlySection title="Languages">
          <Text style={styles.bodyText}>
            {formatArrayData(user.languages)}
          </Text>
        </ReadOnlySection>

        {/* Nationality - AQUI TAMBIEN */}
        <ReadOnlySection title="Nationality">
          <Text style={styles.bodyText}>
            {formatArrayData(user.nationality)}
          </Text>
        </ReadOnlySection>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#f9f9f9" },
  container: { padding: 20, paddingBottom: 40 },
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
  name: {
    fontSize: 28,
    fontWeight: "600",
    marginTop: 24,
    textAlign: "center",
    color: "#111827",
  },
  location: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  label: { 
    fontWeight: "600", 
    marginTop: 8, 
    marginBottom: 8, 
    color: "#374151",
    fontSize: 16 
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 24 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e3edf7",
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { 
    color: "#0066cc",
    fontWeight: "500"
  },
  section: {
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: { 
    fontWeight: "600",
    fontSize: 15,
    color: "#374151"
  },
  sectionBody: { 
    padding: 16 
  },
  bodyText: {
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 20,
  }
});