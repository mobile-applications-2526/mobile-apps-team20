import { FilterTag } from "@/domain/model/enums/filter_tag";
import { EventRepository } from "@/domain/repository/event_repository";
import { create } from "zustand";

// Global state management of the filter selection
interface EventFilterState {
    actualFilter: FilterTag
    setFilterState: (newFilter: FilterTag) => void
}

export const useEventFilterStore = create<EventFilterState>((set, get) => ({
    actualFilter: FilterTag.Location, // Default filter

    setFilterState: (newFilter: FilterTag) => {
        if(newFilter === get().actualFilter) return
        set({actualFilter: newFilter})
    }
}))
