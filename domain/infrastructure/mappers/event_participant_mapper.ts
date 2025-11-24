import { EventParticipantResponseDTO } from "@/domain/model/dto/events/event_participant_response_dto";
import { EventParticipant } from "@/domain/model/entities/events/event_participant";
import { mapProfileToFrontend } from "./user_profile_mapper";



/**
 * Helper to map a single Participant DTO to Frontend Participant interface.
 */
export function mapParticipantToFrontend(dto: EventParticipantResponseDTO): EventParticipant {
    return {
        id: dto.id,
        profile: mapProfileToFrontend(dto.userProfile)
    };
}