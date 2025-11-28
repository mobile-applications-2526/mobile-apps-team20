// components/EventCard.tsx
import React, { useRef, useState } from "react";
import { EventItem } from "@/domain/model/entities/events/event_item";
import { Pressable, StyleSheet, Text, View } from "react-native";
export default function EventCard({
  event,
  onPressed
}: {
  event: EventItem
  onPressed: () => void
}) {

  const [isLoading, setIsLoading] = useState(false)

  return (
    <Pressable onPress={() => {
      if (isLoading) return;

      setIsLoading(true);
      onPressed();

      setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Delay to simulate loading

    }}>
      <View style={styles.eventCard}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventTitle}>{event.id}</Text>
        {/* // TODO */}
      </View>
    </Pressable>
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