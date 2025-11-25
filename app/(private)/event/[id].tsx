import { EventDetailListHeader } from "@/components/events/event_detail_list_header";
import ParticipantCard from "@/components/events/participant_card";
import FloatingBackButton from "@/components/shared/floating_back_button";
import JoinEventButton from "@/components/shared/join_event_button";
import StickyHeader from "@/components/shared/sticky_header";
import { useEventDetailStore } from "@/store/events/use_event_details_store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STICKY_HEADER_THRESHOLD = 250;

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  
  // --- Store hooks ---
  const { 
    event, 
    fetchEventById, 
    fetchEventParticipants, 
    eventParticipants, 
    isLoadingEvent, 
    isLoadingParticipants 
  } = useEventDetailStore();

  // --- Animation logic ---
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [STICKY_HEADER_THRESHOLD - 50, STICKY_HEADER_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // --- Effects ---
  useEffect(() => {
    if (id) {
        const eventId = Array.isArray(id) ? id[0] : id;
        fetchEventById(eventId);
    }
  }, [id]);

  // --- Handlers ---
  const handleJoinEvent = () => console.log("User wants to join event:", id);
  
  const handleProfileNavigation = (userId: string) => console.log("Navigate to profile:", userId);

  const handleLoadMore = () => {
    if (!event) return;
    if (!isLoadingParticipants) {
        fetchEventParticipants(event.id);
    }
  };

  // --- Render Components (Footer & Empty State) ---

  const ListEmptyComponent = () => (
    <Text style={styles.emptyText}>No participants yet.</Text>
  );

  const ListFooter = () => {

    if (event?.participantCount === 0) {
      return ListEmptyComponent()
    }

    if (isLoadingParticipants) {
      return (
        <View style={styles.loaderFooter}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      );
    }
    return null;
  };

  // --- Initial Full Page Loading ---
  if (isLoadingEvent || !event) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FloatingBackButton onPress={() => router.back()} top={top} />

      <StickyHeader
        event={event}
        topInset={top}
        opacity={headerOpacity}
      />

      <Animated.FlatList
        data={eventParticipants}
        keyExtractor={(item) => item.id}
        
        // 1. Header: Encapsulated logic for Event Info + Organiser
        ListHeaderComponent={
          <EventDetailListHeader 
            event={event} 
            onOrganiserPress={handleProfileNavigation} 
          />
        }

        // 2. Items: Participant rows
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 15 }}>
            <ParticipantCard
                participantName={item.profile.name}
                participantImage={item.profile.profileImage ?? ""}
                onPress={() => handleProfileNavigation(item.id)}
            />
          </View>
        )}

        // 3. Footer: Spinner logic or empty label
        ListFooterComponent={ListFooter}

        // Infinite Scroll
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}

        // Animations
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <JoinEventButton onPress={handleJoinEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loaderFooter: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
    marginBottom: 20
  },
});