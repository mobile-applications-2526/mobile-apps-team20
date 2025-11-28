import { InterestTag } from "../../enums/interest_tag";
import { EventOrganiser } from "./event_organiser";

export interface EventItem {
    id: string
    title: string
    description: string
    image: string | null
    interests: InterestTag[]
    organiser: EventOrganiser
    participantCount: number
    city: string
    placeName: string
    startDate: string
    endDate: string
}