import { EventDataSource } from "@/domain/datasources/events/event_datasource";
import { EventListRestult } from "@/domain/model/dto/events/event_list_result";
import { EventParticipantListResult } from "@/domain/model/dto/events/event_participant_list_result";
import { EventRequestDTO } from "@/domain/model/dto/events/event_request_dto";
import { EventItem } from "@/domain/model/entities/events/event_item";
import { EventParticipant } from "@/domain/model/entities/events/event_participant";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import { EventRepository } from "@/domain/repository/events/event_repository";

/**
 * Repository implementation that delegates all data fetching and persistence
 * logic to the EventDataSource layer.
 * * Acts as a boundary between the domain (business logic)
 * and the data layer (API, database, etc.).
 */
export class EventRepositoryImpl implements EventRepository {

  constructor(private readonly dataSource: EventDataSource) {}

  unSubscribeToEvent(eventId: string): Promise<void> {
    return this.dataSource.cancelEventSubscription(eventId)
  }

  /** Fetch a single event by ID */
  async getEventById(eventId: string): Promise<EventItem> {
    return this.dataSource.getEventById(eventId);
  }

  /** Fetch events filtered by one or more interest tags */
  async getEventsByAnyTag(tags: InterestTag[], page: number): Promise<EventListRestult> {
    return this.dataSource.getEventsByAnyTag(tags, page);
  }

  /** Fetch all events for a specific date (sorted ascending) */
  async getEventsByDateAscending(eventDateISO: string, page: number, tags?: InterestTag[]): Promise<EventListRestult> {
    if (tags && tags.length > 0) {
      // Use the new specific endpoint if tags are present
      return this.dataSource.getEventsByDateAndTags(eventDateISO, tags, page);
    }
    // Use the original endpoint if no tags
    return this.dataSource.getEventsByDateAscending(eventDateISO, page);
  }

  /** Fetch all events in a given city */
  async getEventsByLocation(city: string, page: number, tags?: InterestTag[]): Promise<EventListRestult> {
    if (tags && tags.length > 0) {
      // Use the new specific endpoint if tags are present
      return this.dataSource.getEventsByLocationAndTags(city, tags, page);
    }
    // Use the original endpoint if no tags
    return this.dataSource.getEventsByLocation(city, page);
  }

  /** Fetch all participants of an event */
  async getEventParticipants(eventId: string, page: number): Promise<EventParticipantListResult> {
    return this.dataSource.getEventParticipants(eventId, page);
  }

  /** Create a new event (requires authentication) */
  async createEvent(request: FormData): Promise<EventItem> {
    return this.dataSource.createEvent(request);
  }

  /** Subscribe the current user to an event (requires authentication) */
  async subscribeToEvent(eventId: string): Promise<EventParticipant> {
    return this.dataSource.subscribeToEvent(eventId);
  }

  /** Update an existing event (requires authentication) */
  async updateEvent(eventId: string, request: FormData): Promise<EventItem> {
    return this.dataSource.updateEvent(eventId, request);
  }

  /** Delete an event (requires authentication) */
  async deleteEvent(eventId: string): Promise<void> {
    return this.dataSource.deleteEvent(eventId);
  }

  /** Cancel a user's subscription to an event (requires authentication) */
  async cancelEventSubscription(eventId: string): Promise<void> {
    return this.dataSource.cancelEventSubscription(eventId);
  }
}