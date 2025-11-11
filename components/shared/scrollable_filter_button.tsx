// components/ChipFilterBar.tsx
import { InterestTag } from "@/domain/model/enums/interest_tag";
import React, { useRef, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export type ButtonItem = {
  key: InterestTag;      // unique id 
  label: string;    // display text
};

type Props = {
  data: ButtonItem[];
  selectedKey: string;
  onChange: (key: InterestTag) => void;
  contentPaddingHorizontal?: number; 
};

export default function ScrollableFilterButton({
  data,
  selectedKey,
  onChange,
  contentPaddingHorizontal = 16,
}: Props) {
  const listRef = useRef<FlatList<ButtonItem>>(null);

  // Auto-scroll for assuring the selected item is visible
  useEffect(() => {
    const index = data.findIndex((d) => d.key === selectedKey);
    if (index >= 0) listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  }, [selectedKey, data]);

  return (
    <FlatList
      ref={listRef}
      data={data}
      keyExtractor={(item) => item.key}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        { paddingHorizontal: contentPaddingHorizontal },
      ]}
      renderItem={({ item }) => {
        const active = item.key === selectedKey;
        return (
          <TouchableOpacity
            onPress={() => {
              if(item.key == selectedKey) return
              onChange(item.key)
            }}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
            activeOpacity={0.85}
          >
            <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      }}
      // evita error si el scrollToIndex no tiene medidas aún
      onScrollToIndexFailed={(info) => {
        setTimeout(() => {
          listRef.current?.scrollToIndex({
            index: info.index,
            animated: true,
            viewPosition: 0.5,
          });
        }, 50);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 8, // RN 0.71+; si no, usa marginRight en chip
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipInactive: {
    backgroundColor: "#F2F4F7",
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  labelInactive: {
    color: "#344054",
  },
  labelActive: {
    color: "#FFFFFF",
  },
});
