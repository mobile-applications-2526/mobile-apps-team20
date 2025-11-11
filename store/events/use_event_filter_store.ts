import { FilterTag } from "@/domain/model/enums/filter_tag";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import { create } from "zustand";

// Global state management of the filter selection
interface EventFilterState {
    actualFilter: FilterTag
    interestFilter: InterestTag
    setFilter: (newFilter: FilterTag) => void
    setInterest: (newFilter: InterestTag) => void
}

export const useEventFilterStore = create<EventFilterState>((set, get) => ({
    actualFilter: FilterTag.Location, // Default filter
    interestFilter: InterestTag.ALL,

    setFilter: (newFilter: FilterTag) => {
        if(newFilter === get().actualFilter) return
        set({actualFilter: newFilter})
    },

    setInterest: (newFilter: InterestTag) => {
        if(newFilter === get().interestFilter) return
        set({interestFilter: newFilter})
    }
}))
