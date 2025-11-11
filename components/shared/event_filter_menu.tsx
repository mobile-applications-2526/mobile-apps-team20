import { FilterTag, FilterTagLabel } from "@/domain/model/enums/filter_tag";
import { useEventFilterStore } from "@/store/events/use_event_filter_store";
import React, { useMemo } from "react";
import { View } from "react-native";
import DropdownButtonFilter, { FilterOption } from "./filter_dropdown_button";

interface Props {
  // Still accepting [label, render] from the hook to avoid changing the hook now
  filterOptions: [string, () => React.ReactNode][];
  onSelect: (render: () => React.ReactNode) => void;
}

export default function EventFilterMenu({ filterOptions, onSelect }: Props) {
  const selectedTag = useEventFilterStore((s) => s.actualFilter); // GLOBAL selection (tag)

  // Adapt the simple [label, render] array to typed options with tags.
  // We map by comparing labels to FilterTagLabel[...] (robust once labels are consistent).
  const options: FilterOption[] = useMemo(() => {
    const labelToTag = new Map<string, FilterTag>(
      Object.entries(FilterTagLabel).map(([t, label]) => [label as string, Number(t) as FilterTag])
    );
    return filterOptions.map(([label, render]) => ({
      tag: labelToTag.get(label) ?? (null as unknown as FilterTag), // fallback if mismatch
      label,
      render,
    }));
  }, [filterOptions]);

  return (
    <View>
      <DropdownButtonFilter
        options={options}
        selectedTag={selectedTag}
        onSelect={(render /*, tag */) => {
          // Do NOT update global state here — parent/hook handles it
          onSelect(render);
        }}
      />
    </View>
  );
}
