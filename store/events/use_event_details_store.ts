import { container } from "@/dependency_injection/container";
import { EventItem } from "@/domain/model/entities/events/event_item";
import { EventParticipant } from "@/domain/model/entities/events/event_participant";
import { EventRepository } from "@/domain/repository/events/event_repository";
import { getErrorMessage } from "@/shared/utils/error_utils";
import { create } from "zustand";

interface EventDetailStore {
  event: EventItem | null
  eventParticipants: EventParticipant[]

  isLoadingEvent: boolean
  errorLoadingEvent: string | null

  currentPage: number
  isLoadingParticipants: boolean
  errorLoadingParticipants: string | null
  hasMoreParticipants: boolean

  fetchEventParticipants: (id: string) => Promise<void>

  // Action to fetch the event
  fetchEventById: (id: string) => Promise<void>
  
  // Action to clear the state when the screen is left
  refreshEvent: () => void

  reset: () => void
}

// Get the repository once
const eventRepository: EventRepository = container.eventRepository;

export const useEventDetailStore = create<EventDetailStore>((set, get) => ({
  // Default state
  event: null,
  isLoadingEvent: false, 
  errorLoadingEvent: null,

  currentPage: 0,
  eventParticipants: [],
  isLoadingParticipants: false,
  errorLoadingParticipants: null,
  hasMoreParticipants: true,

  reset: () => {
    set({ 
        isLoadingEvent: true, 
        errorLoadingEvent: null, 
        event: null,
        
        // Reset de participantes obligatorio para evitar bugs de paginación
        eventParticipants: [],
        currentPage: 0,
        hasMoreParticipants: true,
        errorLoadingParticipants: null,
        isLoadingParticipants: false
    });
  },
  

  fetchEventParticipants: async (id: string) => {
    const state = get()

    if (state.isLoadingParticipants) return;

    if (!state.hasMoreParticipants) return

    // Set loading state and clear previous errors/data
    set({ isLoadingParticipants: true, errorLoadingParticipants: null }); 
    try {
      const callback = await eventRepository
        .getEventParticipants(id, state.currentPage);

      set({
        eventParticipants: [...state.eventParticipants, ...callback.participants],
        isLoadingParticipants: false,
        currentPage: ++state.currentPage,
        hasMoreParticipants: callback.hasMore
      });

    } catch (err: unknown) {
      set({ errorLoadingParticipants: getErrorMessage(err), isLoadingParticipants: false });
    }
  },

  /**
   * Fetches a single event by ID and updates the store.
   */
  fetchEventById: async (id: string) => {
    const state = get()
    
    if (state.isLoadingEvent) return;

    // Set loading state and clear previous errors/data
    state.reset()
    try {
      // Assuming your repo has a 'getEventById' method
      const fetchedEvent = await eventRepository.getEventById(id);
      
      // Load participants
      if (fetchedEvent.participantCount > 0) {
        await get().fetchEventParticipants(id)
      }
      else {
        // Clear participant state
        set({ eventParticipants: [] })
      }

      set({
        event: fetchedEvent,
        isLoadingEvent: false,
     });

    } catch (err: unknown) {
      set({ errorLoadingEvent: getErrorMessage(err), isLoadingEvent: false });
    }
  },

  /**
   * Clears the store state. This must be called when the component unmounts.
   */
  refreshEvent: () => {
    const state = get()
    if (state.event == null) return

    set({
      currentPage: 0,
      hasMoreParticipants: true,
      eventParticipants: []
    })

    state.fetchEventById(state.event.id)
  },
}));