import React from "react";
import { StyleSheet, Text, View } from "react-native";
import EventHeaderCard from "@/components/events/event_header_card";
import ParticipantCard from "@/components/events/participant_card";
import ScrollableChipList from "@/components/shared/scrollable_chip_list";
import { EventItem } from "@/domain/model/entities/events/event_item";

interface EventDetailListHeaderProps {
  event: EventItem | null;
  onOrganiserPress: (userId: string) => void;
  isMe: (username: string) => boolean;
}

export const EventDetailListHeader = ({ event, onOrganiserPress, isMe }: EventDetailListHeaderProps) => {
  if (!event) return null;

  const organiserName = isMe(event.organiser.profile.name) 
                          ? "You" : event.organiser.profile.name;

  return (
    <View>
      {/* Section 1: Event Main Details Card */}
      <EventHeaderCard
        event={event}
        startDate={event.startDate}
        endDate={event.endDate}
        city={event.city}
        location={event.placeName}
      />

      {/* Section 2: Interest Chips */}
      <View style={styles.defaultContainer}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <ScrollableChipList data={event.interests} />
      </View>

      {/* Section 3: Organiser Profile */}
      <View style={styles.defaultContainer}>
        <Text style={styles.sectionTitle}>Organiser</Text>
        <ParticipantCard
          key={event.organiser.id}
          participantName={organiserName}
          participantImage={event.organiser.profile.profileImage ?? ""}
          onPress={() => onOrganiserPress(event.organiser.profile.id)}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>
          Participants ({event?.participantCount})
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  defaultContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    paddingLeft: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 20,
    marginHorizontal: 10,
  },
});