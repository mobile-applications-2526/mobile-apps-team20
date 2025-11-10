import { EventFormData } from "@/components/events/event_form";
import EventList from "@/components/events/event_list";
import EventModalFormWrapper from "@/components/events/event_modal_form_wrapper";
import { EventMapper } from "@/domain/infrastructure/mappers/event_mapper";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import { useEventStore } from "@/store/use_event_store";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import EventFilterMenu from "@/components/shared/event_filter_menu";
import { useEventFilter } from "@/hooks/events/use_event_filter";

export default function DiscoverPage() {
  // Access global event store (Zustand)
  const otherEvents = useEventStore(state => state.otherEvents);
  const createEvent = useEventStore(state => state.createEvent);
  const fetchOtherEvents = useEventStore(state => state.fetchOtherEvents);

  // Controls the visibility of the "Create Event" modal
  const [showForm, setShowForm] = useState(false);

  // Stores a render function that returns the active filter component (e.g., a DropdownInput)
  const [activeFilterRender, setActiveFilterRender] = useState<(() => React.ReactNode) | null>(null);

  // Set the initial state for fetching by user interests getted from user global state
  useEffect(() => {
    //TODO: Get from user state when implemented
    console.log("Ejecutandooooo")
    fetchOtherEvents((repo) => repo.getEventsByAnyTag([InterestTag.SPORTS]))
  })

  // Handle submit coming from the Create Event modal
  function handleFormSubmit(data: EventFormData) {
    createEvent(EventMapper.fromForm(data));
    setShowForm(false);
  }

  return (
    <View style={styles.container}>
      {/* Header row: title + filter menu button */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Discover new events</Text>
        <EventFilterMenu 
          filterOptions={
            useEventFilter({ onClose: () => setActiveFilterRender(null) })
          }
          onSelect={(render) => setActiveFilterRender(() => render)}
        />
      </View>
      
      {activeFilterRender && <View style={{ marginBottom: 16 }}>{activeFilterRender()}</View>}

      {/* Events list */}
      <EventList
        events={otherEvents}
        paddingBottom={0}
        paddingTop={0}
        emptyComponentLabel="No events yet"
      />

      {/* Floating Action Button to open the Create Event modal */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>

      {/* Create Event modal wrapper */}
      <EventModalFormWrapper
        visible={showForm}
        formLabel={"Create a Moment"}
        onClose={() => setShowForm(false)}
        onFormSubmitted={handleFormSubmit}
      />
    </View>
  );
}

// Styles for the page
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 12, marginTop: 15 },
  emptyText: { color: "#999", textAlign: "center", marginTop: 40 },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#007AFF",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  addButtonText: { color: "white", fontSize: 36, lineHeight: 36 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 12,
  },
});
