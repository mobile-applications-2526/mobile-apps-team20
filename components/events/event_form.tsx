import { InterestTag } from "@/domain/model/enums/interest_tag";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";

// Define the structure of the event form data
export interface EventFormData {
  title: string;
  description: string;
  image?: string;
  interests?: InterestTag[];
  city: string;
  placeName: string;
  startDate: string;
  endDate: string;
}

// Form component for creating a new event
export default function EventForm({
  onClose,
  onFormSubmitted,
  initialValues,
  formLabel
}:
{
  onClose: () => void,                       
  onFormSubmitted: (data: EventFormData) => void
  initialValues?: EventFormData;
  formLabel: string;                 
}
) {
    // Local state for form fields
  const [form, setForm] = useState<EventFormData>(
    initialValues ?? // Use initial values if provided for editing an event that already exists
    {
      title: "",
      description: "",
      image: "",
      interests: [],
      city: "",
      placeName: "",  
      startDate: "",
      endDate: "",
  });

  // Handle form submission received from the parent
  const handleSave = () => {
    onFormSubmitted(form);          
    setForm({                       
      title: "",
      description: "",
      image: "",
      interests: [],
      city: "",
      placeName: "",
      startDate: "",
      endDate: "",
    });
  };

  // TODO: Add field validation as needed
  return (
      <View>
        <Text style={styles.modalHeader}>{formLabel}</Text>
        <TextInput
          placeholder="Title"
          value={form.title}
          onChangeText={(text) => setForm({ ...form, title: text })}
          style={styles.input}
        />
        <TextInput
          placeholder="Description"
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          style={styles.input}
        />
        <TextInput
          placeholder="Image (optional)"
          value={form.image}
          onChangeText={(text) => setForm({ ...form, image: text })}
          style={styles.input}
        />
        {/* <TextInput  //TODO: Change to multi-select dropdown later
          placeholder="Interests"
          value={form.interests}
          onChangeText={(text) => setForm({ ...form, interests: text })}
          style={styles.input}
        /> */}
        <TextInput
          placeholder="City"
          value={form.city}
          onChangeText={(text) => setForm({ ...form, city: text })}
          style={styles.input}
        />
        <TextInput
          placeholder="Place Name"
          value={form.placeName}
          onChangeText={(text) => setForm({ ...form, placeName: text })}
          style={styles.input}
        />
        <TextInput
          placeholder="Start Date"
          value={form.startDate}
          onChangeText={(text) => setForm({ ...form, startDate: text })}
          style={styles.input}
        />
        <TextInput
          placeholder="End Date"
          value={form.endDate}
          onChangeText={(text) => setForm({ ...form, endDate: text })}
          style={styles.input}
        />

        <View style={styles.formButtons}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
          >
            <Text
              style={[
                styles.saveButton,
                !form.title.trim() && { color: "#aaa" },
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}

// Styles for the modal and form
const styles = StyleSheet.create({
  modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: { color: "#555", fontSize: 16 },
  saveButton: { color: "#007AFF", fontWeight: "bold", fontSize: 16 },
});