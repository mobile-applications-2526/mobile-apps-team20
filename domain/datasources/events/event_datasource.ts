import { EventParticipant } from "@/domain/model/entities/events/event_participant";
import { EventRequestDTO } from "../../model/dto/events/event_request_dto";
import { EventItem } from "../../model/entities/events/event_item";
import { InterestTag } from "../../model/enums/interest_tag";
import { EventListRestult } from "@/domain/model/dto/events/event_list_result";
import { EventParticipantListResult } from "@/domain/model/dto/events/event_participant_list_result";

/**
 * Remote DataSource contract for Events 
 */
export interface EventDataSource {
  /** GET /api/events/{eventId} */
  getEventById(eventId: string): Promise<EventItem>;

  /** GET /api/events/by-any-tag?tags=MUSIC&tags=SPORTS */
  getEventsByAnyTag(tags: InterestTag[], page: number): Promise<EventListRestult>;

  /** GET /api/events/by-date?eventDate=YYYY-MM-DDTHH:mm:ss */
  getEventsByDateAscending(eventDateISO: string, page: number): Promise<EventListRestult>;

  /** GET /api/events/by-location?city=Leuven */
  getEventsByLocation(city: string, page: number): Promise<EventListRestult>;

  /** GET /api/events/{eventId}/participants */
  getEventParticipants(eventId: string, page: number): Promise<EventParticipantListResult>;

  getEventsByDateAndTags(eventDateISO: string, tags: InterestTag[], page: number): Promise<EventListRestult>;
  
  getEventsByLocationAndTags(city: string, tags: InterestTag[], page: number): Promise<EventListRestult>;

  /** POST /api/events (auth) */
  createEvent(request: FormData): Promise<EventItem>;

  /** POST /api/events/participants/{participantId} (auth) */
  subscribeToEvent(eventId: string): Promise<EventParticipant>;

  /** PUT /api/events/{eventId} (auth) */
  updateEvent(eventId: string, request: FormData): Promise<EventItem>;

  /** DELETE /api/events/{eventId} (auth) */
  deleteEvent(eventId: string): Promise<void>;

  /** DELETE /api/events/{eventId}/participants (auth) */
  cancelEventSubscription(eventId: string): Promise<void>;
}
