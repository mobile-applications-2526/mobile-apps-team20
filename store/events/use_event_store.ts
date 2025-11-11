import { create } from "zustand";
import { container } from "@/dependency_injection/container";
import { getErrorMessage } from "@/shared/error_utils";

import { EventRequestDTO } from "@/domain/model/dto/events/event_request_dto";
import { EventItem } from "@/domain/model/entities/events/event_item";
import { EventRepository } from "@/domain/repository/events/event_repository";
import { InterestTag } from "@/domain/model/enums/interest_tag";

interface EventStore {
  myEvents: EventItem[];
  otherEvents: EventItem[];
  filteredEvents: EventItem[];
  loading: boolean;
  error: string | null;
  eventRepository: EventRepository;

  updateFilteredEvents: (interest: InterestTag) => void
  fetchMyEvents: () => Promise<void>;
  fetchOtherEvents: (
    fetchCallback: (repo: EventRepository) => Promise<EventItem[]>
  ) => Promise<void>;
  createEvent: (data: EventRequestDTO) => Promise<void>;
  deleteMyEvent: (id: string) => Promise<void>;
}

export const useEventStore = create<EventStore>((set, get) => ({
  myEvents: [],
  otherEvents: [],
  filteredEvents: [],
  eventRepository: container.eventRepository,
  loading: false,
  error: null,

  /**
   * Fetch events created by the current user (requires authentication).
   * Keep the scaffold ready even if backend isn’t implemented yet.
   */
  fetchMyEvents: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: replace with real repo call when available, e.g.:
      // const events = await container.eventRepository.getMyEvents();
      const events: EventItem[] = [];
      set({ myEvents: events, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },

  /**
   * Fetch other users' events (for discovery). The concrete repository
   * method is injected via callback to keep this store generic.
   */
  fetchOtherEvents: async (
    fetchCallback: (repo: EventRepository) => Promise<EventItem[]>
  ) => {
    set({ loading: true, error: null });
    try {
      const repo = get().eventRepository;
      const events = await fetchCallback(repo);
      set({ otherEvents: events, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },

  updateFilteredEvents: (interest: InterestTag) => {
    set({
      filteredEvents: get().otherEvents.filter((event) =>
        event.interests.includes(interest)
      )
    });
  },

  /**
   * Create a new event and add it to `myEvents`.
   */
  createEvent: async (data: EventRequestDTO) => {
    set({ loading: true, error: null });
    try {
      const newEvent = await get().eventRepository.createEvent(data);
      set({ myEvents: [...get().myEvents, newEvent], loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },

  /**
   * Delete an existing event by ID and update local state.
   */
  deleteMyEvent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await get().eventRepository.deleteEvent(id);
      set({
        myEvents: get().myEvents.filter((e) => e.id !== id),
        loading: false,
      });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
}));
