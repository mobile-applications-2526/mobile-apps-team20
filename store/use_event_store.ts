import { Event } from "@/models/Event";
import { create } from "zustand";

// This store manages events data and actions 
// It interacts with a backend API to fetch and manipulate event data

interface EventStore {
  myEvents: Event[];
  otherEvents: Event[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchMyEvents: () => Promise<void>;
  fetchOtherEvents: () => Promise<void>;
  addMyEvent: (data: Omit<Event, "id" | "organiser">) => Promise<void>; // Organiser will be set server-side
  deleteMyEvent: (id: string) => Promise<void>;
}

export const useEventStore = create<EventStore>((set, get) => ({
    myEvents: [],
    otherEvents: [],
    loading: false,
    error: null,

    fetchMyEvents: async () => {
        // TODO
    },

    fetchOtherEvents: async () => {
        // TODO
    },

    addMyEvent: async (data) => {
        // TODO
    },
        
    deleteMyEvent: async (id) => {
        // TODO
    },
}));
