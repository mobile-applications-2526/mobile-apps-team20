import { EventItem } from "@/domain/model/entities/events/event_item";
import React from "react";
import {
    FlatList,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import EventCard from "./event_card";

type Props = {
  events: EventItem[];
  emptyComponentLabel?: string;
  headerLabel?: string;
  paddingTop?: number;
  paddingBottom?: number;
  // Allow external override of the FlatList content container padding/margins
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function EventList({
  events,
  emptyComponentLabel,
  headerLabel,
  paddingTop = 0,
  paddingBottom = 0,
  contentContainerStyle,
}: Props) {
  // Render a compact header only when provided (avoid extra vertical space)
  const header =
    headerLabel && headerLabel.trim().length > 0 ? (
      <Text style={styles.header}>{headerLabel}</Text>
    ) : null;

  return (
    <FlatList
      data={events}
      keyExtractor={(item: EventItem) => String(item.id)}
      renderItem={({ item }) => <EventCard event={item} />}

      // Header only if present → no empty spacing otherwise
      ListHeaderComponent={header}

      // Empty state only if label provided
      ListEmptyComponent={
        emptyComponentLabel ? (
          <Text style={styles.emptyText}>{emptyComponentLabel}</Text>
        ) : null
      }

      // Add a small vertical gap between items
      ItemSeparatorComponent={() => <View style={styles.separator} />}

      // Keep top/bottom paddings minimal and externally controllable
      contentContainerStyle={[
        { paddingTop, paddingBottom },
        contentContainerStyle,
      ]}

      // Prevent iOS from auto-insetting content at the top
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator
    />
  );
}

const styles = StyleSheet.create({
  // Compact header so it doesn’t push the list down
  header: { fontSize: 18, fontWeight: "700", marginTop: 6, marginBottom: 6 },

  // Subtle empty-state styling
  emptyText: { color: "#999", textAlign: "center", marginTop: 24 },

  // Small gap between cards (tweak to taste: 6–12 works well)
  separator: { height: 8 },
});
