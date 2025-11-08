import { InterestTag } from "../enums/interest_tag"
import { EventOrganiserResponseDTO } from "./event_organiser_response"

export interface EventResponseDTO {
    id: string
    title: string
    description: string
    image?: string
    interests: InterestTag[]
    organiser: EventOrganiserResponseDTO
    city: string
    placeName: string
    chatId: string
    startDate: string
    endDate: string
}