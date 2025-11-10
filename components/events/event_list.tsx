import { EventItem } from "@/domain/model/entities/event_item";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
} from "react-native";
import EventCard from "./event_card";

type Props = {
  events: EventItem[];
  emptyComponentLabel?: string;
  headerLabel?: string;
  paddingTop?: number;
  paddingBottom?: number;
  contentContainerStyle?: StyleProp<ViewStyle>; // ← permite controlar padding desde fuera
};

export default function EventList({
  events,
  emptyComponentLabel,
  headerLabel,
  paddingTop = 0,
  paddingBottom = 0,
  contentContainerStyle,
}: Props) {
  const header =
    headerLabel && headerLabel.trim().length > 0 ? (
      <Text style={styles.header}>{headerLabel}</Text>
    ) : null;

  return (
    <FlatList
      data={events}
      keyExtractor={(item: EventItem) => String(item.id)}
      renderItem={({ item }) => <EventCard event={item} />}
      ListHeaderComponent={header} // ← null si no hay label → no hay hueco
      ListEmptyComponent={
        emptyComponentLabel ? (
          <Text style={styles.emptyText}>{emptyComponentLabel}</Text>
        ) : null
      }
      contentContainerStyle={[
        { paddingTop, paddingBottom },
        contentContainerStyle, // ← override externo
      ]}
      contentInsetAdjustmentBehavior="never" // ← evita insets automáticos (iOS)
      showsVerticalScrollIndicator
    />
  );
}

const styles = StyleSheet.create({
  // Márgenes muy contenidos para no empujar la lista
  header: { fontSize: 18, fontWeight: "700", marginTop: 6, marginBottom: 6 },
  emptyText: { color: "#999", textAlign: "center", marginTop: 24 },
});
