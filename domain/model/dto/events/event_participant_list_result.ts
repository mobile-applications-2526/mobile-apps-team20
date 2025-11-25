import { EventParticipant } from "../../entities/events/event_participant";

export interface EventParticipantListResult {
    participants: EventParticipant[]
    hasMore: boolean
}