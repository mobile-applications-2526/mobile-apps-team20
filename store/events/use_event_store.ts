import { container } from "@/dependency_injection/container";
import { getErrorMessage } from "@/shared/utils/error_utils";
import { create } from "zustand";

import { EventRequestDTO } from "@/domain/model/dto/events/event_request_dto";
import { EventItem } from "@/domain/model/entities/events/event_item";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import { EventRepository } from "@/domain/repository/events/event_repository";

interface EventStore {
  myEvents: EventItem[];
  otherEvents: EventItem[];
  filteredEvents: EventItem[];
  eventRepository: EventRepository;

  // --- Granular Loading States ---
  loadingMyEvents: boolean;
  loadingOtherEvents: boolean;
  loadingCreate: boolean;
  // Use string|null to store the ID of the event being deleted
  loadingDelete: string | null;

  // --- Granular Error States ---
  errorMyEvents: string | null;
  errorOtherEvents: string | null;
  errorCreate: string | null;
  errorDelete: string | null;

  // --- Actions ---
  updateFilteredEvents: (interest: InterestTag) => void;
  fetchMyEvents: () => Promise<void>;
  fetchOtherEvents: (
    fetchCallback: (repo: EventRepository) => Promise<EventItem[]>
  ) => Promise<void>;
  createEvent: (data: EventRequestDTO) => Promise<void>;
  deleteMyEvent: (id: string) => Promise<void>;
}

export const useEventStore = create<EventStore>((set, get) => ({
  // --- Default State ---
  myEvents: [],
  otherEvents: [],
  filteredEvents: [],
  eventRepository: container.eventRepository,

  // Granular loading defaults
  loadingMyEvents: false,
  loadingOtherEvents: false,
  loadingCreate: false,
  loadingDelete: null,

  // Granular error defaults
  errorMyEvents: null,
  errorOtherEvents: null,
  errorCreate: null,
  errorDelete: null,

  /**
   * Fetch events created by the current user.
   */
  fetchMyEvents: async () => {
    // Set loading/error specific to this action
    set({ loadingMyEvents: true, errorMyEvents: null });
    try {
      // TODO: replace with real repo call
      const events: EventItem[] = []; // await container.eventRepository.getMyEvents();
      set({ myEvents: events, loadingMyEvents: false });
    } catch (err: unknown) {
      set({ errorMyEvents: getErrorMessage(err), loadingMyEvents: false });
    }
  },

  /**
   * Fetch other users' events (for discovery).
   */
  fetchOtherEvents: async (
    fetchCallback: (repo: EventRepository) => Promise<EventItem[]>
  ) => {
    // Set loading/error specific to this action
    set({ loadingOtherEvents: true, errorOtherEvents: null });
    try {
      const repo = get().eventRepository;
      const events = await fetchCallback(repo);
      console.log("🔍 Primer Evento:", JSON.stringify(events[0], null, 2));
      set({ otherEvents: events, loadingOtherEvents: false });
    } catch (err: unknown) {
      set({
        errorOtherEvents: getErrorMessage(err),
        loadingOtherEvents: false,
      });
    }
  },

  /**
   * Synchronous action to filter locally stored events.
   * No loading/error state needed here.
   */
  updateFilteredEvents: (interest: InterestTag) => {
    set({
      filteredEvents: get().otherEvents.filter((event) =>
        event.interests.includes(interest)
      ),
    });
  },

  /**
   * Create a new event and add it to `myEvents`.
   */
  createEvent: async (data: EventRequestDTO) => {
    // Set loading/error specific to this action
    set({ loadingCreate: true, errorCreate: null });
    try {
      const newEvent = await get().eventRepository.createEvent(data);
      set({
        myEvents: [...get().myEvents, newEvent],
        loadingCreate: false,
      });
    } catch (err: unknown) {
      set({ errorCreate: getErrorMessage(err), loadingCreate: false });
    }
  },

  /**
   * Delete an existing event by ID and update local state.
   */
  deleteMyEvent: async (id: string) => {
    // Set loading/error specific to this action
    // Store the ID to show loading on a specific item
    set({ loadingDelete: id, errorDelete: null });
    try {
      await get().eventRepository.deleteEvent(id);
      set({
        myEvents: get().myEvents.filter((e) => e.id !== id),
        loadingDelete: null, // Clear loading on success
      });
    } catch (err: unknown) {
      set({ errorDelete: getErrorMessage(err), loadingDelete: null }); // Clear loading on error
    }
  },
}));