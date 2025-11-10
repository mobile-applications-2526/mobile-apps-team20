// DiscoverPage.tsx
import { EventFormData } from "@/components/events/event_form";
import EventList from "@/components/events/event_list";
import EventModalFormWrapper from "@/components/events/event_modal_form_wrapper";
import { EventMapper } from "@/domain/infrastructure/mappers/event_mapper";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import { useEventStore } from "@/store/use_event_store";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import EventFilterMenu from "@/components/shared/event_filter_menu";
import { useEventFilter } from "@/hooks/events/use_event_filter";


export default function DiscoverPage() {
  const otherEvents = useEventStore((s) => s.otherEvents);
  const createEvent = useEventStore((s) => s.createEvent);
  const fetchOtherEvents = useEventStore((s) => s.fetchOtherEvents);

  const [showForm, setShowForm] = useState(false);

  // Render function for the active filter (e.g., <DropdownInput />)
  const [activeFilterRender, setActiveFilterRender] =
    useState<(() => React.ReactNode) | null>(null);

  // Overlay visibility for the filter (STACK overlay)
  const [filterVisible, setFilterVisible] = useState(false);

  // Initial filter state
  useEffect(() => {
    fetchOtherEvents((repo) => repo.getEventsByAnyTag([InterestTag.ART]));
  }, []);

  function handleFormSubmit(data: EventFormData) {
    createEvent(EventMapper.fromForm(data));
    setShowForm(false);
  }

  const closeFilter = () => {
    setFilterVisible(false);
    setActiveFilterRender(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Discover new events</Text>

        <EventFilterMenu
          filterOptions={useEventFilter({ onClose: closeFilter })}
          onSelect={(render) => {
            setActiveFilterRender(() => render);
            setFilterVisible(true);
          }}
        />
      </View>

      {/* Events list */}
      <EventList
        events={otherEvents}
        paddingBottom={0}
        paddingTop={0}
        emptyComponentLabel="No events yet"
      />

      {/* FAB */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>

      {/* OVERLAY with TRANSPARENT wrapper */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFilter}
      >
        {/* Fullscreen backdrop (tap outside to close) */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeFilter}>
          {/* Prevent closing when tapping inside the content */}
          <TouchableWithoutFeedback>
            {/* Wrapper without background/borders: child renders its own card */}
            <View style={styles.filterOverlayWrapper}>
              {activeFilterRender && activeFilterRender()}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Create Event modal */}
      <EventModalFormWrapper
        visible={showForm}
        formLabel={"Create a Moment"}
        onClose={() => setShowForm(false)}
        onFormSubmitted={handleFormSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 15
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 10,
  },

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

  // === OVERLAY ===
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)", // dimmed background
    paddingHorizontal: 20,
    paddingTop: 100, // offset from the header
  },

  // TRANSPARENT wrapper: no extra card behind the child
  filterOverlayWrapper: {
    alignSelf: "center",
    maxWidth: 600,
  },
});
