import React, { useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FilterDropdownButtonProps {
  // Tuple per option: [label to show, render function that returns the UI to mount outside]
  options: [string, () => React.ReactNode][];
  // Called when an option is selected. We pass the render function up to the parent.
  onSelect: (render: () => React.ReactNode, index: number) => void;
  // Optional index of the currently active filter (for highlight)
  selectedIndex?: number | null;
}

/**
 * Dropdown filter button with visual highlight for selected filter.
 * - When a filter is active, the main button turns darker and shows its label.
 * - Highlights the selected option in the dropdown as well.
 */
export default function DropdownButtonFilter({
  options,
  onSelect,
  selectedIndex = null,
}: FilterDropdownButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Toggle dropdown state with smooth animation
  const toggleDropdown = () => {
    Animated.timing(animation, {
      toValue: isOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  // Animated style (fade + vertical scale)
  const dropdownStyle = {
    opacity: animation,
    transform: [
      {
        scaleY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  };

  // Main button label (shows selected filter name if any)
  const mainLabel =
    selectedIndex != null ? `${options[selectedIndex][0]} ⌄` : "Filter ⌄";

  return (
    <View style={styles.container}>
      {/* Main trigger button */}
      <TouchableOpacity
        style={[
          styles.mainButton,
          selectedIndex != null && styles.mainButtonActive,
        ]}
        onPress={toggleDropdown}
      >
        <Text
          style={[
            styles.mainButtonText,
            selectedIndex != null && styles.mainButtonTextActive,
          ]}
        >
          {mainLabel}
        </Text>
      </TouchableOpacity>

      {/* Floating dropdown menu */}
      {isOpen && (
        <Animated.View style={[styles.dropdown, dropdownStyle]}>
          {options.map(([label, render], index) => {
            const isSelected = selectedIndex === index;
            return (
              <React.Fragment key={label}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => {
                    onSelect(render, index);
                    setIsOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>

                {index < options.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    marginBottom: -8,
    marginRight: 1,
    position: "relative",
    zIndex: 10,
  },
  mainButton: {
    backgroundColor: "#007AFF",
    height: 45,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mainButtonActive: {
    backgroundColor: "#0056D2", // darker when active
  },
  mainButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  mainButtonTextActive: {
    color: "#E8F0FE", // lighter text when active
  },
  dropdown: {
    position: "absolute",
    top: 55,
    right: 4,
    backgroundColor: "white",
    borderRadius: 14, // ✅ smoother border radius
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    width: 190,
    zIndex: 20,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 10, // rounded inner corners
  },
  optionButtonSelected: {
    backgroundColor: "#E8F0FE", // highlight selected option
  },
  optionText: {
    fontSize: 15,
    color: "#333",
  },
  optionTextSelected: {
    color: "#007AFF", // blue for active text
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
    opacity: 0.7,
  },
});
