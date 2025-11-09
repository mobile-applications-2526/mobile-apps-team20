import { container } from "@/dependency_injection/container";
import { EventMapper } from "@/domain/infrastructure/mappers/event_mapper";
import { EventRequestDTO } from "@/domain/model/dto/event_request_dto";
import { EventItem } from "@/domain/model/entities/event_item";
import { EventRepository } from "@/domain/repository/event_repository";
import { create } from "zustand";

// This store manages events data and actions 
// It interacts with a backend API to fetch and manipulate event data

interface EventStore {
  myEvents: EventItem[];
  otherEvents: EventItem[];
  loading: boolean;
  error: string | null;

  // Actions
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
  loading: false,
  error: null,

  /**
   * Fetch events created by the current user (requires authentication)
   */
  fetchMyEvents: async () => {
    // TODO: Waiting for the backend to implement it
  },

  /**
   * Fetch other users' events (for discovery)
   */
  fetchOtherEvents: async (fetchCallback: (repo: EventRepository) => Promise<EventItem[]>) => {
  set({ loading: true, error: null });
  try {
    const repo = container.eventRepository;
    const events = await fetchCallback(repo);
    set({
      otherEvents: events, // From JSON to Entity
      loading: false
    });
  } catch (err: any) {
    set({ error: err.message || "Failed to fetch events", loading: false });
  }
},

  /**
   * Create a new event 
   */
  createEvent: async (data: EventRequestDTO) => {
    set({ loading: true, error: null });
    try {
      const newEvent = await container.eventRepository.createEvent(data);
      set({
        myEvents: [
            ...get().myEvents,
            newEvent
        ],
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to create event", loading: false });
    }
  },

  /**
   * Delete an existing event by ID
   */
  deleteMyEvent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await container.eventRepository.deleteEvent(id);
      set({
        myEvents: get().myEvents.filter((e) => e.id !== id),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to delete event", loading: false });
    }
  },
}));
