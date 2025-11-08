// src/domain/datasources/event_datasource_impl.ts
import { EventDataSource } from "@/domain/datasources/event_datasource";
import type { EventParticipantResponseDTO } from "@/domain/model/dto/event_participant_response_dto";
import type { EventRequestDTO } from "@/domain/model/dto/event_request_dto";
import type { EventResponseDTO } from "@/domain/model/dto/event_response_dto";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import type { ApiService } from "@/domain/services/api_service";

export class EventDataSourceImpl implements EventDataSource {
  constructor(private readonly api: ApiService) {}

  async getEventById(eventId: string): Promise<EventResponseDTO> {
    return this.api.get<EventResponseDTO>(`/events/${eventId}`);
  }

  /**
   * GET /api/events/by-any-tag?tags=MUSIC&tags=SPORTS
   * With axios + qs paramsSerializer, arrays are serialized as repeated keys.
   */
  async getEventsByAnyTag(tags: InterestTag[]): Promise<EventResponseDTO[]> {
    return this.api.get<EventResponseDTO[]>(`/events/by-any-tag`, { tags });
  }

  /**
   * GET /api/events/by-date?eventDate=2025-10-15T00:00:00
   * Send ISO-8601 string.
   */
  async getEventsByDateAscending(eventDateISO: string): Promise<EventResponseDTO[]> {
    return this.api.get<EventResponseDTO[]>(`/events/by-date`, { eventDate: eventDateISO });
  }

  /**
   * GET /api/events/by-location?city=Leuven
   */
  async getEventsByLocation(city: string): Promise<EventResponseDTO[]> {
    return this.api.get<EventResponseDTO[]>(`/events/by-location`, { city });
  }

  /**
   * GET /api/events/{eventId}/participants
   */
  async getEventParticipants(eventId: string): Promise<EventParticipantResponseDTO[]> {
    return this.api.get<EventParticipantResponseDTO[]>(`/events/${eventId}/participants`);
  }

  /**
   * POST /api/events (auth)
   */
  async createEvent(request: EventRequestDTO): Promise<EventResponseDTO> {
    return this.api.post<EventResponseDTO>(`/events`, request, true);
  }

  /**
   * POST /api/events/participants/{participantId}  (auth)
   * Updated to your new backend signature (no userId in path).
   */
  async subscribeToEvent(participantId: string): Promise<EventParticipantResponseDTO> {
    return this.api.post<EventParticipantResponseDTO>(
      `/events/participants/${participantId}`,
      undefined,
      true
    );
  }

  /**
   * PUT /api/events/{eventId} (auth)
   */
  async updateEvent(eventId: string, request: EventRequestDTO): Promise<EventResponseDTO> {
    return this.api.put<EventResponseDTO>(`/events/${eventId}`, request, true);
  }

  /**
   * DELETE /api/events/{eventId} (auth)
   */
  async deleteEvent(eventId: string): Promise<void> {
    await this.api.delete<void>(`/events/${eventId}`, true);
  }

  /**
   * DELETE /api/events/{eventId}/participants (auth)
   * Updated to your new backend signature (no userProfileId in path).
   */
  async cancelEventSubscription(eventId: string): Promise<void> {
    await this.api.delete<void>(`/events/${eventId}/participants`, true);
  }
}
