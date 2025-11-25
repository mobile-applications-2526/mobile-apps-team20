import { EventItem } from "../../entities/events/event_item";

export interface EventListRestult {
    events: EventItem[]
    hasMore: boolean
}