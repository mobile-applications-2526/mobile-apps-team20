// components/EventCard.tsx
import { EventItem } from "@/domain/model/entities/event_item";
import { StyleSheet, Text, View } from "react-native";

export default function EventCard({event}: { event: EventItem }) {
  return (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{event.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});