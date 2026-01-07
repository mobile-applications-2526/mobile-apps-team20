import { EventParticipant } from "@/domain/model/entities/events/event_participant";
import { EventRequestDTO } from "../../model/dto/events/event_request_dto";
import { EventItem } from "../../model/entities/events/event_item";
import { InterestTag } from "../../model/enums/interest_tag";
import { EventListRestult } from "@/domain/model/dto/events/event_list_result";
import { EventParticipantListResult } from "@/domain/model/dto/events/event_participant_list_result";

/**
 * Domain repository contract for Events
 */
export interface EventRepository {

  unSubscribeToEvent(eventId: string): Promise<void>;

  getEventById(eventId: string): Promise<EventItem>;

  getEventsByAnyTag(tags: InterestTag[], page: number): Promise<EventListRestult>;

  getEventsByDateAscending(eventDateISO: string, page: number, tags?: InterestTag[]): Promise<EventListRestult>;

  getEventsByLocation(city: string, page: number, tags?: InterestTag[]): Promise<EventListRestult>;

  getEventParticipants(eventId: string, page: number): Promise<EventParticipantListResult>;

  createEvent(request: FormData): Promise<EventItem>;

  subscribeToEvent(eventId: string): Promise<EventParticipant>;

  updateEvent(eventId: string, request: FormData): Promise<EventItem>;

  deleteEvent(eventId: string): Promise<void>;

  cancelEventSubscription(eventId: string): Promise<void>;
}
