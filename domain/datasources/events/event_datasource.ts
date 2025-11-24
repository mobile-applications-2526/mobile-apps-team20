import { EventParticipant } from "@/domain/model/entities/events/event_participant";
import { EventRequestDTO } from "../../model/dto/events/event_request_dto";
import { EventItem } from "../../model/entities/events/event_item";
import { InterestTag } from "../../model/enums/interest_tag";

/**
 * Remote DataSource contract for Events 
 */
export interface EventDataSource {
  /** GET /api/events/{eventId} */
  getEventById(eventId: string): Promise<EventItem>;

  /** GET /api/events/by-any-tag?tags=MUSIC&tags=SPORTS */
  getEventsByAnyTag(tags: InterestTag[], page: number, size: number): Promise<EventItem[]>;

  /** GET /api/events/by-date?eventDate=YYYY-MM-DDTHH:mm:ss */
  getEventsByDateAscending(eventDateISO: string, page: number, size: number): Promise<EventItem[]>;

  /** GET /api/events/by-location?city=Leuven */
  getEventsByLocation(city: string, page: number, size: number): Promise<EventItem[]>;

  /** GET /api/events/{eventId}/participants */
  getEventParticipants(eventId: string, page: number, size: number): Promise<EventParticipant[]>;

  /** POST /api/events (auth) */
  createEvent(request: EventRequestDTO): Promise<EventItem>;

  /** POST /api/events/participants/{participantId} (auth) */
  subscribeToEvent(participantId: string): Promise<EventParticipant>;

  /** PUT /api/events/{eventId} (auth) */
  updateEvent(eventId: string, request: EventRequestDTO): Promise<EventItem>;

  /** DELETE /api/events/{eventId} (auth) */
  deleteEvent(eventId: string): Promise<void>;

  /** DELETE /api/events/{eventId}/participants (auth) */
  cancelEventSubscription(eventId: string): Promise<void>;
}
