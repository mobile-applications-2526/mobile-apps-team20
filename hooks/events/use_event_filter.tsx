import DropdownInput from "@/components/shared/drop_down_input";
import { FilterTag, FilterTagLabel } from "@/domain/model/enums/filter_tag";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface UseEventFilterProps {
  onClose: () => void;
  onLocationChange: (location: string) => void;
  onDateChange: (date: string) => void;
  onModeChange: (mode: FilterTag) => void;
}

export function useEventFilter({
  onClose,
  onLocationChange,
  onDateChange,
  onModeChange
}: UseEventFilterProps): [string, () => React.ReactNode][] {

  const filterOptions: [string, () => React.ReactNode][] = [
      [
        FilterTagLabel[FilterTag.Location],
        () => (
          <DropdownInput
            label="Introduce a location"
            onSubmit={(value) => {
              const trimmed = value.trim();
              if (!trimmed) return;

              // 1. Update the specific data state
              onLocationChange(trimmed);
              
              // 2. Switch the mode to Location
              onModeChange(FilterTag.Location);
            
              // 3. Close the modal (The useEffect in DiscoverPage will trigger the fetch)
              onClose();
            }}
            onCancel={() => onClose()}
          />
        ),
      ],

      [
        // TODO: Format date & create another component for it
        FilterTagLabel[FilterTag.Date],
        () => (
          <DateFilterContent
            onConfirm={(selectedDate) => {
              // 1. Update the specific data state (YYYY-MM-DD)
              onDateChange(selectedDate);

              // 2. Switch the mode to Date
              onModeChange(FilterTag.Date);

              // 3. Close
              onClose();
            }}
            onCancel={onClose}
          />
        ),
      ],
  ];
  return filterOptions;
}

interface DateFilterContentProps {
  onConfirm: (date: string) => void; // date in YYYY-MM-DD
  onCancel: () => void;
}

function DateFilterContent({ onConfirm, onCancel }: DateFilterContentProps) {
  const [value, setValue] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleApply = () => {
    const isoDate = value.toISOString().split("T")[0]; // YYYY-MM-DD
    onConfirm(isoDate);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Select a date</Text>

      <TouchableOpacity
        style={styles.dateBox}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateBoxText}>
          {value.toISOString().split("T")[0]}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selected) => {
            if (Platform.OS !== "ios") {
              setShowPicker(false);
            }
            if (selected) setValue(selected);
          }}
        />
      )}

      <View style={styles.buttonsRow}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleApply}>
          <Text style={[styles.buttonText, styles.applyText]}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  dateBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  dateBoxText: {
    color: "#111827",
    fontSize: 14,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  buttonText: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cancelText: {
    color: "#6b7280",
    marginRight: 8,
  },
  applyText: {
    color: "#2563eb",
    fontWeight: "600",
  },
});