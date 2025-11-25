import { container } from "@/dependency_injection/container";
import { EventListRestult } from "@/domain/model/dto/events/event_list_result";
import { EventItem } from "@/domain/model/entities/events/event_item";
import { FilterTag } from "@/domain/model/enums/filter_tag";
import { EventRepository } from "@/domain/repository/events/event_repository";
import { getErrorMessage } from "@/shared/utils/error_utils";
import { create } from "zustand";

export interface EventsStore {
  events: EventItem[];
  currentPage: number;
  hasMore: boolean;
  actualFilter: FilterTag;
  repository: EventRepository
  
  // --- Granular Loading States ---
  loading: boolean;
  
  // --- Granular Error States ---
  error: string | null;

  // --- Actions ---
  // fetchCallback is now passed here
  loadNextPage: (fetchCallback: (repo: EventRepository, page: number) => Promise<EventListRestult>) => Promise<void>;
  reset: () => void; 
  setFilter: (newFilter: FilterTag) => void
}

export const useEventsStore = create<EventsStore>((set, get) => ({
  events: [],
  currentPage: 0,
  hasMore: true,
  loading: false,
  error: null,
  actualFilter: FilterTag.Location,
  repository: container.eventRepository,

  /**
   * Fetch other users' events (for discovery).
   */
  loadNextPage: async (fetchCallback) => {
    const state = get();

    // Avoid fetch more time while loading & when there are no more events
    if (state.loading || !state.hasMore) return;

    const actualPage = state.currentPage

    // Set loading/error specific to this action
    set({ loading: true, error: null });
    try {
      const callback = await fetchCallback(state.repository, actualPage);

      set({
        events: [...state.events, ...callback.events],
        loading: false,
        currentPage: actualPage + 1,
        hasMore: callback.hasMore,
      });
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err),
        loading: false,
        hasMore: false
      });
    }
  },

  reset: () => {
    set({
      events: [],
      currentPage: 0,
      hasMore: true,
      loading: false,
      error: null
    });
  },

  setFilter: async (newFilter: FilterTag) => {
    const state = get()

    if (state.actualFilter == newFilter) return

    // If filter has changed
    state.reset()
  }
}));