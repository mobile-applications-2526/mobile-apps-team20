import { EventDetailListHeader } from "@/components/events/event_detail_list_header";
import ParticipantCard from "@/components/events/participant_card";
import FloatingBackButton from "@/components/shared/floating_back_button";
import JoinEventButton from "@/components/shared/join_event_button";
import StickyHeader from "@/components/shared/sticky_header";
import { useEventDetailPage } from "@/hooks/events/use_event_details_page";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function EventDetailScreen() {
  const {
    event,
    eventParticipants,
    isLoadingEvent,
    isLoadingParticipants,
    loadingSubscription,
    insets,
    scrollY,
    headerOpacity,
    handleJoinEvent,
    handleProfileNavigation,
    handleLoadMore,
    handleGoBack,
    isOrganiser,
    isJoined, 
    isMe,
    handleLeaveEvent 
  } = useEventDetailPage();

  // --- Render Components (Footer & Empty State) ---

  const ListEmptyComponent = () => (
    <Text style={styles.emptyText}>No participants yet.</Text>
  );

  const ListFooter = () => {
    if (event?.participantCount === 0) {
      return ListEmptyComponent();
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
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Navigation */}
      <FloatingBackButton onPress={handleGoBack} top={insets.top} />

      {/* Sticky Header */}
      <StickyHeader
        event={event}
        topInset={insets.top}
        opacity={headerOpacity}
      />

      <Animated.FlatList
        data={eventParticipants}
        keyExtractor={(item) => item.id}
        
        ListHeaderComponent={
          <EventDetailListHeader
            isMe={isMe}
            event={event}
            onOrganiserPress={handleProfileNavigation}
          />
        }
        
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 15 }}>
            <ParticipantCard
              participantName={isMe(item.profile.name) ? "You" : item.profile.name}
              participantImage={item.profile.profileImage ?? ""}
              onPress={() => handleProfileNavigation(item.profile.id)}
            />
          </View>
        )}
        
        ListFooterComponent={ListFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* --- BUTTON LOGIC --- */}
      <JoinEventButton 
        onPress={
          isOrganiser ? handleLeaveEvent
            : isJoined ? handleLeaveEvent
            : handleJoinEvent
        } 
        label={
          isOrganiser ?
            "Delete Event"
            : isJoined ?
              "Leave Event"
              :
              "Join Event"
        }
        variant={isJoined || isOrganiser ? "destructive" : "primary"}
        isLoading={loadingSubscription}
      />
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
    textAlign: "center",
    marginTop: 20,
    color: "gray",
    marginBottom: 20,
  },
});