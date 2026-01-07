import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { EventItem } from "@/domain/model/entities/events/event_item"; // Adjust path if needed
import { Calendar, Clock, MapPin } from "lucide-react-native";
import { dateParser } from "@/shared/utils/date_parser_util";

export default function EventCard({
  event,
  onPressed
}: {
  event: EventItem
  onPressed: () => void
}) {
  const [isLoading, setIsLoading] = useState(false);

  // Parse dates
  const start = dateParser(event.startDate);
  const end = dateParser(event.endDate);

  // Formatting to match design: "Fri, Nov 15, 2023"
  const formattedDate = `${start.dayName.slice(0, 3)}, ${start.month.slice(0, 3)} ${start.day}, ${start.year}`;
  
  // Formatting to match design: "7:00 PM - 11:00 PM"
  const formattedTime = `${start.time} - ${end.time}`;

  const handlePress = () => {
    if (isLoading) return;
    setIsLoading(true);
    onPressed();
    
    // Simulate loading delay as requested
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Pressable 
      onPress={handlePress} 
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.cardContent}>
        
        {/* --- Image Section --- */}
          <View style={styles.imageContainer}>
            {event.image ? (
              <Image 
                source={{ uri: event.image }} 
                style={styles.image} 
                resizeMode="cover" 
              />
            ) : (
              <View style={styles.placeholder}>
               {/* Letter instead of Icon */}
               <Text style={styles.placeholderText}>
                 {event.title ? event.title.charAt(0).toUpperCase() : "?"}
               </Text>
            </View>
          )}
        </View>

        {/* --- Details Section --- */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>

          {/* Date Row */}
          <View style={styles.infoRow}>
            <Calendar size={16} color="#6B7280" style={styles.icon} />
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>

          {/* Time Row */}
          <View style={styles.infoRow}>
            <Clock size={16} color="#6B7280" style={styles.icon} />
            <Text style={styles.infoText}>{formattedTime}</Text>
          </View>

          {/* Location Row (using placeName) */}
          <View style={styles.infoRow}>
            <MapPin size={16} color="#6B7280" style={styles.icon} />
            <Text style={styles.infoText} numberOfLines={1}>
              {event.placeName}, {event.city}
            </Text>
          </View>
        </View>

      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16, // Spacing between cards
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    // Shadow/Elevation
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  pressed: {
    opacity: 0.9,
  },
  cardContent: {
    borderRadius: 16,
    overflow: "hidden", // Ensures image respects top corners
    backgroundColor: "#FFFFFF",
  },
  imageContainer: {
    height: 140, // Height based on visual proportion
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F7", // Very light gray (Matches ChatsScreen)
  },
  placeholderText: {
    color: "#1C1C1E", // Dark text (Matches ChatsScreen)
    fontSize: 50,
    fontWeight: "bold",
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700", // Bold title
    color: "#111827", // Dark text
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6, // Spacing between rows
  },
  icon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280", // Gray-500
    fontWeight: "500",
  },
});