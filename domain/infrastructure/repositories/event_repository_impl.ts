import { EventRepository } from "@/domain/repository/event_repository";
import { EventDataSource } from "@/domain/datasources/event_datasource";
import { EventParticipantResponseDTO } from "@/domain/model/dto/event_participant_response_dto";
import { EventRequestDTO } from "@/domain/model/dto/event_request_dto";
import { EventResponseDTO } from "@/domain/model/dto/event_response_dto";
import { InterestTag } from "@/domain/model/enums/interest_tag";

/**
 * Repository implementation that delegates all data fetching and persistence
 * logic to the EventDataSource layer.
 * 
 * This class acts as a boundary between the domain (business logic)
 * and the data layer (API, database, etc.).
 */
export class EventRepositoryImpl implements EventRepository {

  constructor(private readonly dataSource: EventDataSource) {}

  /**
   * Fetch a single event by ID
   */
  async getEventById(eventId: string): Promise<EventResponseDTO> {
    return this.dataSource.getEventById(eventId);
  }

  /**
   * Fetch events filtered by one or more interest tags
   */
  async getEventsByAnyTag(tags: InterestTag[]): Promise<EventResponseDTO[]> {
    return this.dataSource.getEventsByAnyTag(tags);
  }

  /**
   * Fetch all events for a specific date (sorted ascending)
   */
  async getEventsByDateAscending(eventDateISO: string): Promise<EventResponseDTO[]> {
    return this.dataSource.getEventsByDateAscending(eventDateISO);
  }

  /**
   * Fetch all events in a given city
   */
  async getEventsByLocation(city: string): Promise<EventResponseDTO[]> {
    return this.dataSource.getEventsByLocation(city);
  }

  /**
   * Fetch all participants of an event
   */
  async getEventParticipants(eventId: string): Promise<EventParticipantResponseDTO[]> {
    return this.dataSource.getEventParticipants(eventId);
  }

  /**
   * Create a new event (requires authentication)
   */
  async createEvent(request: EventRequestDTO): Promise<EventResponseDTO> {
    return this.dataSource.createEvent(request);
  }

  /**
   * Subscribe the current user to an event (requires authentication)
   */
  async subscribeToEvent(eventId: string): Promise<EventParticipantResponseDTO> {
    return this.dataSource.subscribeToEvent(eventId);
  }

  /**
   * Update an existing event (requires authentication)
   */
  async updateEvent(eventId: string, request: EventRequestDTO): Promise<EventResponseDTO> {
    return this.dataSource.updateEvent(eventId, request);
  }

  /**
   * Delete an event (requires authentication)
   */
  async deleteEvent(eventId: string): Promise<void> {
    return this.dataSource.deleteEvent(eventId);
  }

  /**
   * Cancel a user's subscription to an event (requires authentication)
   */
  async cancelEventSubscription(eventId: string): Promise<void> {
    return this.dataSource.cancelEventSubscription(eventId);
  }
}
