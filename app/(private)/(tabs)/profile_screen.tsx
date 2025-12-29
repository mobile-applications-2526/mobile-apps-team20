import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const AVATAR = require("assets/images/profilePictureNotExistent.png");
const Section = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.section}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
};

export default function ProfileScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarWrapper}>
        <Image source={AVATAR} style={styles.avatar} />
      </View>
      <Text style={styles.name}>Alex Doe</Text>
      <Text style={styles.subtitle}>Computer Science</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Interests</Text>
      <View style={styles.chipsRow}>
        {['AI', 'Hiking', 'Photography', 'Startups'].map((tag) => (
          <View key={tag} style={styles.chip}>
            <Text style={styles.chipText}>{tag}</Text>
          </View>
        ))}
      </View>

      <Section title="Bio" defaultOpen={false}>
        <Text>
          A passionate computer science student with a keen interest in artificial intelligence
          and machine learning. In my free time, I enjoy hiking and photography.
        </Text>
      </Section>

      <Section title="Languages" defaultOpen={false}>
        <Text>Add your languages here…</Text>
      </Section>

      <Section title="Nationality" defaultOpen={false}>
        <Text>Add your nationality here…</Text>
      </Section>

      <Section title="Social Media" defaultOpen={false}>
        <Text>Add your social media here…</Text>
      </Section>

      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
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
  section: {
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#e3edf7",
  },
  sectionTitle: { fontWeight: "600" },
  sectionBody: { padding: 16 },
  avatarWrapper: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48, 
    backgroundColor: "#e3edf7", 
  },
});