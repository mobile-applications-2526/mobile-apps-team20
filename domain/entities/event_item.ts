import { EventBio } from "./event_bio";
import { EventOrganiser } from "./event_organiser";

export interface EventItem {
    id: string
    title: string
    bio: EventBio
    organiser: EventOrganiser
    city: string
    placeName: string
    chatId: string
    startDate: string
    endDate: string
}