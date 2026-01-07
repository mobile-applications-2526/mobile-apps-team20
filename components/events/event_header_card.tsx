import React from "react";
import { Image, View, Text, StyleSheet } from "react-native";
import EventDateInfo from "./event_date_info";

type EventHeaderCardProps = {
  event: {
    title: string;
    description: string;
    image?: string
  };
  startDate: string
  endDate: string
  city: string
  location: string
};

/**
 * Displays the main event details card at the top of the scroll view.
 */
export default function EventHeaderCard({
  event,
  startDate,
  endDate, 
  city,
  location
}: EventHeaderCardProps) {
  return (
    <View style={[styles.card, styles.headerCard]}>
      
      {/* Logic for Image or Light Gray Placeholder */}
      {event.image ? (
        <Image 
          source={{ uri: event.image }} 
          style={styles.roundImage} 
        />
      ) : (
        <View style={[styles.roundImage, styles.placeholder]}>
          <Text style={styles.placeholderText}>
            {event.title ? event.title.charAt(0).toUpperCase() : "?"}
          </Text>
        </View>
      )}

      <Text style={styles.title}>{event.title}</Text>

      {/* Event date info component */}
      <EventDateInfo
        city={city}
        location={location}
        startDate={startDate} 
        endDate={endDate}
      />

      <View style={styles.divider} />

      <Text style={styles.description}>{event.description}</Text>
    </View>
  );
}

// Styles for this component
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerCard: {
    marginTop: 60, 
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    width: "90%",
    marginVertical: 15,
    alignSelf: "center",
  },
  roundImage: {
    width: '80%',        
    height: 180,         
    borderRadius: 80,    
    resizeMode: 'cover', 
    marginBottom: 20,
  },
  // --- UPDATED STYLES START ---
  placeholder: {
    backgroundColor: "#F2F2F7", // Very light gray (Matches other screens)
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#1C1C1E", // Dark text (Matches other screens)
    fontSize: 60, 
    fontWeight: "bold",
  }
});