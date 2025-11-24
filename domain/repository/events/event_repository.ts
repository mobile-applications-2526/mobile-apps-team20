import { EventParticipant } from "@/domain/model/entities/events/event_participant";
import { EventParticipantResponseDTO } from "../../model/dto/events/event_participant_response_dto";
import { EventRequestDTO } from "../../model/dto/events/event_request_dto";
import { EventItem } from "../../model/entities/events/event_item";
import { InterestTag } from "../../model/enums/interest_tag";

/**
 * Domain repository contract for Events
 */
export interface EventRepository { 
  getEventById(eventId: string): Promise<EventItem>;

  getEventsByAnyTag(tags: InterestTag[], page: number, size: number): Promise<EventItem[]>;

  getEventsByDateAscending(eventDateISO: string, page: number, size: number): Promise<EventItem[]>;

  getEventsByLocation(city: string, page: number, size: number): Promise<EventItem[]>;

  getEventParticipants(eventId: string, page: number, size: number): Promise<EventParticipant[]>;

  createEvent(request: EventRequestDTO): Promise<EventItem>;

  subscribeToEvent(eventId: string): Promise<EventParticipant>;

  updateEvent(eventId: string, request: EventRequestDTO): Promise<EventItem>;

  deleteEvent(eventId: string): Promise<void>;

  cancelEventSubscription(eventId: string): Promise<void>;
}
