import { InterestTag } from "@/domain/model/enums/interest_tag";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AVAILABLE_INTERESTS = Object.values(InterestTag);

interface InterestSelectorProps {
  selectedInterestsString: string;
  onSelectionChange: (newString: string) => void;
}

export function InterestSelector({ selectedInterestsString, onSelectionChange }: InterestSelectorProps) {
  
  // Parse string to array, but keeping the original casing for the list logic
  const selectedList = useMemo(() => {
    if (!selectedInterestsString) return [];
    return selectedInterestsString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [selectedInterestsString]);

  // Create a normalized Set for easy case-insensitive checking (for the UI color)
  const selectedSetNormalized = useMemo(() => {
    return new Set(selectedList.map(s => s.toLowerCase()));
  }, [selectedList]);

  const toggleInterest = (interest: string) => {
    const interestLower = interest.toLowerCase();
    let newList: string[];

    if (selectedSetNormalized.has(interestLower)) {
      // REMOVE: Filter out the item (comparing loosely)
      newList = selectedList.filter((i) => i.toLowerCase() !== interestLower);
    } else {
      // ADD: Push the clean Title Case string
      newList = [...selectedList, interest];
    }

    // Update the parent string
    onSelectionChange(newList.join(", "));
  };

  return (
    <View style={styles.selectorContainer}>
      <FlatList
        data={AVAILABLE_INTERESTS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.selectorContent}
        renderItem={({ item }) => {
          // Check if selected (case insensitive)
          const isSelected = selectedSetNormalized.has(item.toLowerCase());

          return (
            <TouchableOpacity
              style={[
                styles.selectorItem,
                isSelected && styles.selectorItemSelected, // Applies Blue BG
              ]}
              onPress={() => toggleInterest(item)}
            >
              <Text
                style={[
                  styles.selectorText,
                  isSelected && styles.selectorTextSelected, // Applies Blue Text
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  selectorContainer: {
    marginBottom: 10,
  },
  selectorContent: {
    paddingVertical: 4,
  },
  selectorItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6", // Default Gray
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectorItemSelected: {
    backgroundColor: "#e3edf7", // Light Blue Background
    borderColor: "#0066cc",     // Blue Border
  },
  selectorText: {
    color: "#374151",
    fontWeight: "500",
  },
  selectorTextSelected: {
    color: "#0066cc", // Dark Blue Text
    fontWeight: "600",
  },
});