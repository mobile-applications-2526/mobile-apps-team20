import { InterestTag } from "@/domain/model/enums/interest_tag";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { InterestSelector } from "../shared/interest_selector";
import { DateMapper } from "@/shared/utils/date_mapper";

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

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [startDateValue, setStartDateValue] = useState<Date | undefined>(
    form.startDate ? new Date(form.startDate) : undefined
  );
  const [endDateValue, setEndDateValue] = useState<Date | undefined>(
    form.endDate ? new Date(form.endDate) : undefined
  );

  const [imagePreviewUri, setImagePreviewUri] = useState<string | undefined>(
    undefined
  );

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.8,
        includeBase64: false, // We need the URI for Multipart, not Base64
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert("Image error", response.errorMessage || "Failed to pick image");
          return;
        }
        const asset = response.assets && response.assets[0];
        if (!asset) return;

        // Logic to support MultipartFile
        // We store the URI directly.
        if (asset.uri) {
          setForm((prev) => ({ ...prev, image: asset.uri }));
          setImagePreviewUri(asset.uri);
        }
      }
    );
  };

  // Handle form submission received from the parent
  const handleSave = () => {
    const start = form.startDate ? new Date(form.startDate) : null;
    const end = form.endDate ? new Date(form.endDate) : null;

    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert("Invalid dates", "Please select both a start and end date.");
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    const maxDurationMs = 24 * 60 * 60 * 1000;

    if (diffMs <= 0 || diffMs >= maxDurationMs) {
      Alert.alert(
        "Invalid duration",
        "The event must be longer than 0 hours and shorter than 24 hours."
      );
      return;
    }

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

  return (
      <View style={{ flex: 1 }}> 
        {/* Wrapped in View/ScrollView to ensure scrolling if content is too long */}
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={styles.modalHeader}>{formLabel}</Text>

        {/* Image picker area
        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
          {imagePreviewUri ? (
            <Image
              source={{ uri: imagePreviewUri }}
              style={styles.imagePreview}
            />
          ) : (
            <Text style={styles.imagePickerText}>+ Add image</Text>
          )}
        </TouchableOpacity>
        */}

          <Text style={styles.fieldLabel}>Event name</Text>
          <TextInput
            placeholder="Event name"
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
            style={styles.input}
          />
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            placeholder="Description"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            style={styles.input}
          />

          {/* --- INTERESTS SECTION --- */}
          <Text style={styles.fieldLabel}>Interests</Text>
          <InterestSelector
            // Convert Array -> String for the component
            selectedInterestsString={form.interests ? form.interests.join(", ") : ""}
            // Convert String -> Array for the Form State
            onSelectionChange={(newString) => {
              const newArray = newString
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0) as InterestTag[];
              
              setForm((prev) => ({ ...prev, interests: newArray }));
            }}
          />
          {/* ---------------------------------- */}

          {/* Location section */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionHeaderText}>Location</Text>
          </View>
        
          <Text style={styles.fieldLabel}>City</Text>
          <TextInput
            placeholder="City"
            value={form.city}
            onChangeText={(text) => setForm({ ...form, city: text })}
            style={styles.input}
          />
          <Text style={styles.fieldLabel}>Location name</Text>
          <TextInput
            placeholder="Location name"
            value={form.placeName}
            onChangeText={(text) => setForm({ ...form, placeName: text })}
            style={styles.input}
          />

          {/* Time section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderIcon}>🗓️</Text>
            <Text style={styles.sectionHeaderText}>Time</Text>
          </View>
          <Text style={styles.fieldLabel}>Start date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={{ color: form.startDate ? "#000" : "#9ca3af" }}>
              {startDateValue
                ? startDateValue.toLocaleDateString()
                : "Select start date"}
            </Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDateValue || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedDate) => {
                if (Platform.OS !== "ios") {
                  setShowStartDatePicker(false);
                }
                if (selectedDate) {
                  // Preserve previous time if set
                  const base = startDateValue || new Date();
                  const combined = new Date(selectedDate);
                  combined.setHours(
                    base.getHours(),
                    base.getMinutes(),
                    0,
                    0
                  );
                  setStartDateValue(combined);
                  // 2. CORREGIDO: Usar toISOStringLocal
                  setForm((prev) => ({ ...prev, startDate: DateMapper.toISOStringLocal(combined) }));
                }
              }}
            />
          )}
          <Text style={styles.fieldLabel}>Start time</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text style={{ color: startDateValue ? "#000" : "#9ca3af" }}>
              {startDateValue
                ? startDateValue.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select start time"}
            </Text>
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={startDateValue || new Date()}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedTime) => {
                if (Platform.OS !== "ios") {
                  setShowStartTimePicker(false);
                }
                if (selectedTime) {
                  const base = startDateValue || new Date();
                  const combined = new Date(base);
                  combined.setHours(
                    selectedTime.getHours(),
                    selectedTime.getMinutes(),
                    0,
                    0
                  );
                  setStartDateValue(combined);
                  // 3. CORREGIDO: Usar toISOStringLocal
                  setForm((prev) => ({ ...prev, startDate: DateMapper.toISOStringLocal(combined) }));
                }
              }}
            />
          )}
          <Text style={styles.fieldLabel}>End date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={{ color: form.endDate ? "#000" : "#9ca3af" }}>
              {endDateValue
                ? endDateValue.toLocaleDateString()
                : "Select end date"}
            </Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDateValue || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedDate) => {
                if (Platform.OS !== "ios") {
                  setShowEndDatePicker(false);
                }
                if (selectedDate) {
                  const base = endDateValue || new Date();
                  const combined = new Date(selectedDate);
                  combined.setHours(
                    base.getHours(),
                    base.getMinutes(),
                    0,
                    0
                  );
                  setEndDateValue(combined);
                  // 4. CORREGIDO: Usar toISOStringLocal
                  setForm((prev) => ({ ...prev, endDate: DateMapper.toISOStringLocal(combined) }));
                }
              }}
            />
          )}
          <Text style={styles.fieldLabel}>End time</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text style={{ color: endDateValue ? "#000" : "#9ca3af" }}>
              {endDateValue
                ? endDateValue.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select end time"}
            </Text>
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={endDateValue || new Date()}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedTime) => {
                if (Platform.OS !== "ios") {
                  setShowEndTimePicker(false);
                }
                if (selectedTime) {
                  const base = endDateValue || new Date();
                  const combined = new Date(base);
                  combined.setHours(
                    selectedTime.getHours(),
                    selectedTime.getMinutes(),
                    0,
                    0
                  );
                  setEndDateValue(combined);
                  // 5. CORREGIDO: Usar toISOStringLocal
                  setForm((prev) => ({ ...prev, endDate: DateMapper.toISOStringLocal(combined) }));
                }
              }}
            />
          )}

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
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  imagePicker: {
    height: 160,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
    overflow: "hidden",
  },
  imagePickerText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
    marginRight: 6,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  sectionHeaderIcon: {
    marginRight: 6,
    fontSize: 14,
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
    padding: 10,
    marginBottom: 10,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  cancelButton: { color: "#555", fontSize: 16 },
  saveButton: { color: "#007AFF", fontWeight: "bold", fontSize: 16 },
});