import DropdownInput from "@/components/shared/drop_down_input";
import { FilterTag, FilterTagLabel } from "@/domain/model/enums/filter_tag";
import { DateMapper } from "@/shared/utils/date_mapper";
// Adjust import path to where your mapper is located
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
              onLocationChange(trimmed);
              onModeChange(FilterTag.Location);
              onClose();
            }}
            onCancel={() => onClose()}
          />
        ),
      ],

      [
        FilterTagLabel[FilterTag.Date],
        () => (
          <DateFilterContent
            onConfirm={(selectedDate) => {
              onDateChange(selectedDate);
              onModeChange(FilterTag.Date);
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
  onConfirm: (date: string) => void; 
  onCancel: () => void;
}

function DateFilterContent({ onConfirm, onCancel }: DateFilterContentProps) {
  const [value, setValue] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleApply = () => {

    const startOfDay = DateMapper.toStartOfDay(value);
    const formattedDate = DateMapper.toISOStringLocal(startOfDay);    
    
    onConfirm(formattedDate);
  };

  // Helper for UI display only
  const displayDate = DateMapper.toPersistence(value);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Select a date</Text>

      <TouchableOpacity
        style={styles.dateBox}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateBoxText}>
          {displayDate}
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
            if (selected) {
                // We keep the time as-is during selection to avoid jumping,
                // stripping happens on 'Apply'
                setValue(selected);
            }
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