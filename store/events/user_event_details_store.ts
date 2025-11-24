import { container } from "@/dependency_injection/container";
import { EventItem } from "@/domain/model/entities/events/event_item";
import { EventParticipant } from "@/domain/model/entities/events/event_participant";
import { EventRepository } from "@/domain/repository/events/event_repository";
import { getErrorMessage } from "@/shared/utils/error_utils";
import { create } from "zustand";

interface EventDetailStore {
  event: EventItem | null;
  eventParticipants: EventParticipant[] | null;
  isLoadingEvent: boolean;
  errorLoadingEvent: string | null;
  isLoadingParticipants: boolean;
  errorLoadingParticipants: string | null;

  fetchEventParticipants: (id: string) => Promise<void>

  // Action to fetch the event
  fetchEventById: (id: string) => Promise<void>;
  
  // Action to clear the state when the screen is left
  clearEvent: () => void;
}

// Get the repository once
const eventRepository: EventRepository = container.eventRepository;

export const useEventDetailStore = create<EventDetailStore>((set, get) => ({
  // Default state
  event: null,
  eventParticipants: null,
  isLoadingEvent: true, // Start in loading state
  isLoadingParticipants: true,
  errorLoadingEvent: null,
  errorLoadingParticipants: null,
  

  fetchEventParticipants: async (id: string) => {
    // Set loading state and clear previous errors/data
    set({ isLoadingParticipants: true, errorLoadingParticipants: null }); 
    try {
      // Assuming your repo has a 'getEventById' method
      const eventParticipants = await eventRepository.getEventParticipants(id);
      console.log(eventParticipants)
      set({ eventParticipants: eventParticipants, isLoadingParticipants: false });
    } catch (err: unknown) {
      set({ errorLoadingParticipants: getErrorMessage(err), isLoadingParticipants: false });
    }
  },

  /**
   * Fetches a single event by ID and updates the store.
   */
  fetchEventById: async (id: string) => {
    // Set loading state and clear previous errors/data
    set({ isLoadingEvent: true, errorLoadingEvent: null, event: null }); 
    try {
      // Assuming your repo has a 'getEventById' method
      const fetchedEvent = await eventRepository.getEventById(id);
      console.log(JSON.stringify(fetchedEvent, null, 2))
      
      // Load participants 
      await get().fetchEventParticipants(id)

      console.log(fetchedEvent)
      set({ event: fetchedEvent, isLoadingEvent: false });
    } catch (err: unknown) {
      set({ errorLoadingEvent: getErrorMessage(err), isLoadingEvent: false });
    }
  },

  /**
   * Clears the store state. This must be called when the component unmounts.
   */
  clearEvent: () => {
    set({ event: null, isLoadingEvent: true, errorLoadingEvent: null });
  },
}));