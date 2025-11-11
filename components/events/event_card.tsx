// components/EventCard.tsx
import { EventItem } from "@/domain/model/entities/events/event_item";
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
    backgroundColor: "#ffffffff",
    padding: 35,
    borderRadius: 20,
    elevation: 1,
  },
  eventTitle: {
  fontSize: 18,
  fontWeight: "600",
  color: "black", 
},
});