// DiscoverPage.tsx
import { EventFormData } from "@/components/events/event_form";
import EventList from "@/components/events/event_list";
import EventModalFormWrapper from "@/components/events/event_modal_form_wrapper";
import EventFilterMenu from "@/components/shared/event_filter_menu";
import ScrollableFilterButton from "@/components/shared/scrollable_filter_button";
import { EventMapper } from "@/domain/infrastructure/mappers/event_mapper";
import { EventItem } from "@/domain/model/entities/events/event_item";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import { useEventFilter } from "@/hooks/events/use_event_filter";
import { useEventFilterStore } from "@/store/events/use_event_filter_store";
import { useEventStore } from "@/store/events/use_event_store";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";


export default function DiscoverPage() {
  const otherEvents = useEventStore((s) => s.otherEvents);
  const eventsFilteredByInterest = useEventStore((s) => s.filteredEvents);
  const updateFilteredEvents = useEventStore((s) => s.updateFilteredEvents);
  const createEvent = useEventStore((s) => s.createEvent);
  const fetchOtherEvents = useEventStore((s) => s.fetchOtherEvents);
  const interestFilter = useEventFilterStore((s) => s.interestFilter);
  const setInterest = useEventFilterStore((s) => s.setInterest);

  const [showForm, setShowForm] = useState(false);
  let isInterestAll = interestFilter === InterestTag.ALL

  // Render function for the active filter (e.g., <DropdownInput />)
  const [activeFilterRender, setActiveFilterRender] =
    useState<(() => React.ReactNode) | null>(null);

  // Overlay visibility for the filter (STACK overlay)
  const [filterVisible, setFilterVisible] = useState(false);

  const filterButtons = Object.values(InterestTag)
    .map(tag => ({
      key: tag,
      label: tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase(), // From ALL to All
    }))

  // Listen for changes in the interest filter and update the events accordingly
  useEffect(() => {
  // cuando cambian eventos o el filtro (y no es ALL), recalcula filtrados
  if (interestFilter === InterestTag.ALL) return;
  updateFilteredEvents(interestFilter);
}, [otherEvents, interestFilter]);

  
  // Filter the events by the interest tag
  const onFilterByInterestTagChanged = (tag: InterestTag) => {
    setInterest(tag);
  }

  // Initial filter state (TODO: take the user location by default)
  useEffect(() => {
    fetchOtherEvents((repo) => repo.getEventsByLocation("Leuven"));
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
        <Text style={styles.header}>Discover events 🌍</Text>

        <View style={{marginRight: 12, marginTop: 5}}>
          <EventFilterMenu
          filterOptions={useEventFilter({ onClose: closeFilter })}
          onSelect={(render) => {
            setActiveFilterRender(() => render);
            setFilterVisible(true);
          }}
        />
        </View>
      </View>
        {/* Interest Tag Filter */}
      <View style={styles.header}>
        <ScrollableFilterButton
          data={filterButtons}
          onChange={onFilterByInterestTagChanged}
          selectedKey={interestFilter}
          contentPaddingHorizontal={filterButtons.length}
        />
      </View>

      {/* Events list */}
      <EventList
        events={isInterestAll ? otherEvents : eventsFilteredByInterest}
        emptyComponentLabel="No events yet 😕"
        contentContainerStyle={{paddingTop: 0}}
      />

      {/* Add event button */}
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
