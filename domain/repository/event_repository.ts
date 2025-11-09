import { EventParticipantResponseDTO } from "../model/dto/event_participant_response_dto";
import { EventRequestDTO } from "../model/dto/event_request_dto";
import { EventItem } from "../model/entities/event_item";
import { InterestTag } from "../model/enums/interest_tag";

/**
 * Domain repository contract for Events
 */
export interface EventRepository { 
  getEventById(eventId: string): Promise<EventItem>;

  getEventsByAnyTag(tags: InterestTag[]): Promise<EventItem[]>;

  getEventsByDateAscending(eventDateISO: string): Promise<EventItem[]>;

  getEventsByLocation(city: string): Promise<EventItem[]>;

  getEventParticipants(eventId: string): Promise<EventParticipantResponseDTO[]>;

  createEvent(request: EventRequestDTO): Promise<EventItem>;

  subscribeToEvent(eventId: string): Promise<EventParticipantResponseDTO>;

  updateEvent(eventId: string, request: EventRequestDTO): Promise<EventItem>;

  deleteEvent(eventId: string): Promise<void>;

  cancelEventSubscription(eventId: string): Promise<void>;
}
