import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import EventList from "@/components/events/event_list";
import EventModalFormWrapper from "@/components/events/event_modal_form_wrapper";
import EventFilterMenu from "@/components/shared/event_filter_menu";
import ScrollableFilterButton from "@/components/shared/scrollable_filter_button";
import { useDiscoverPage } from "@/hooks/events/use_discover_page";

export default function DiscoverPage() {
  const {
    events,
    loadingEvents,
    emptyMessage,
    interestFilter,
    filterButtons,
    filterOptions,
    showForm,
    filterVisible,
    activeFilterRender,
    setShowForm,
    closeFilter,
    onFilterByInterestTagChanged,
    handleFormSubmit,
    handleLoadMore,
    handleSelectFilter,
    handleRefresh
  } = useDiscoverPage();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Discover events 🌍</Text>

        <View style={{ marginRight: 12, marginTop: 5 }}>
          <EventFilterMenu
            filterOptions={filterOptions}
            onSelect={handleSelectFilter}
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
        events={events}
        emptyComponentLabel={emptyMessage}
        contentContainerStyle={{ paddingTop: 0 }}
        onLoadMore={handleLoadMore}
        isLoadingMore={loadingEvents}
        handleRefresh={handleRefresh}
      />

      {/* Add event button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowForm(true)}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>


      {/* OVERLAY with TRANSPARENT wrapper */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFilter}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeFilter}
        >
          <TouchableWithoutFeedback>
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
    marginTop: 15,
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

  provisionalLogoutButton: {
    position: "absolute",
    bottom: 100,
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
  provisionalLogoutButtonLabel: { color: "white", fontSize: 9, lineHeight: 36 },

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