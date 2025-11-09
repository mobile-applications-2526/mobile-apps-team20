import { EventParticipantResponseDTO } from "../model/dto/event_participant_response_dto";
import { EventRequestDTO } from "../model/dto/event_request_dto";
import { EventItem } from "../model/entities/event_item";
import { InterestTag } from "../model/enums/interest_tag";

/**
 * Remote DataSource contract for Events 
 */
export interface EventDataSource {
  /** GET /api/events/{eventId} */
  getEventById(eventId: string): Promise<EventItem>;

  /** GET /api/events/by-any-tag?tags=MUSIC&tags=SPORTS */
  getEventsByAnyTag(tags: InterestTag[]): Promise<EventItem[]>;

  /** GET /api/events/by-date?eventDate=YYYY-MM-DDTHH:mm:ss */
  getEventsByDateAscending(eventDateISO: string): Promise<EventItem[]>;

  /** GET /api/events/by-location?city=Leuven */
  getEventsByLocation(city: string): Promise<EventItem[]>;

  /** GET /api/events/{eventId}/participants */
  getEventParticipants(eventId: string): Promise<EventParticipantResponseDTO[]>;

  /** POST /api/events (auth) */
  createEvent(request: EventRequestDTO): Promise<EventItem>;

  /** POST /api/events/participants/{participantId} (auth) */
  subscribeToEvent(participantId: string): Promise<EventParticipantResponseDTO>;

  /** PUT /api/events/{eventId} (auth) */
  updateEvent(eventId: string, request: EventRequestDTO): Promise<EventItem>;

  /** DELETE /api/events/{eventId} (auth) */
  deleteEvent(eventId: string): Promise<void>;

  /** DELETE /api/events/{eventId}/participants (auth) */
  cancelEventSubscription(eventId: string): Promise<void>;
}
