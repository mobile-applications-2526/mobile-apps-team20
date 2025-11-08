import { EventParticipantResponseDTO } from "../model/dto/event_participant_response_dto";
import { EventRequestDTO } from "../model/dto/event_request_dto";
import { EventResponseDTO } from "../model/dto/event_response_dto";
import { InterestTag } from "../model/enums/interest_tag";

export interface EventRepository { 
    // Contract for event repository methods
    getEventById(eventId: string): Promise<EventResponseDTO>;

    getEventsByAnyTag(tags: InterestTag[]): Promise<EventResponseDTO[]>;

    getEventsByDateAscending(eventDateISO: string): Promise<EventResponseDTO[]>;

    getEventsByLocation(city: string): Promise<EventResponseDTO[]>;

    getEventParticipants(eventId: string): Promise<EventParticipantResponseDTO[]>;

    createEvent(request: EventRequestDTO): Promise<EventResponseDTO>;

    subscribeToEvent(eventId: string): Promise<EventParticipantResponseDTO>;

    updateEvent(eventId: string, request: EventRequestDTO): Promise<EventResponseDTO>;

    deleteEvent(eventId: string): Promise<void>;

    cancelEventSubscription(eventId: string): Promise<void>;
}