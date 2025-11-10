import React, { useState } from "react";
import { View } from "react-native";
import DropdownButtonFilter from "./filter_dropdown_button";

interface EventFilterMenuProps {
  filterOptions: [string, () => React.ReactNode][];
  onSelect: (render: () => React.ReactNode) => void;
}

export default function EventFilterMenu({ filterOptions, onSelect }: EventFilterMenuProps) {
  // Default filter index (e.g. 0 = first filter active at startup)
  const [selectedFilterIndex, setSelectedFilterIndex] = useState<number | null>(0);

  return (
    <View>
      <DropdownButtonFilter
        options={filterOptions}
        selectedIndex={selectedFilterIndex}   // this prop is required for color highlighting
        onSelect={(render, index) => {
          setSelectedFilterIndex(index);      // updates highlight color
          onSelect(render);                   // passes render function up to parent
        }}
      />
    </View>
  );
}
