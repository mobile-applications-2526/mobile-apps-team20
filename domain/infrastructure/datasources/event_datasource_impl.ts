// src/domain/datasources/event_datasource_impl.ts
import { EventDataSource } from "@/domain/datasources/event_datasource";
import type { EventParticipantResponseDTO } from "@/domain/model/dto/event_participant_response_dto";
import type { EventRequestDTO } from "@/domain/model/dto/event_request_dto";
import type { EventResponseDTO } from "@/domain/model/dto/event_response_dto";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import type { ApiService } from "@/domain/services/api_service";
import { EventMapper } from "../mappers/event_mapper";
import { EventItem } from "@/domain/model/entities/event_item";

export class EventDataSourceImpl implements EventDataSource {
  constructor(private readonly api: ApiService) {}

  /** GET /api/events/{eventId} */
  async getEventById(eventId: string): Promise<EventItem> {
    const response = await this.api.get<EventResponseDTO>(`/events/${eventId}`);
    return EventMapper.entityFromJson(response);
  }

  /** GET /api/events/by-any-tag?tags=MUSIC&tags=SPORTS */
  async getEventsByAnyTag(tags: InterestTag[]): Promise<EventItem[]> {
    const response = await this.api.get<EventResponseDTO[]>(`/events/by-any-tag`, { tags });
    return EventMapper.entityFromJsonList(response);
  }

  /** GET /api/events/by-date?eventDate=2025-10-15T00:00:00 */
  async getEventsByDateAscending(eventDateISO: string): Promise<EventItem[]> {
    const response = await this.api.get<EventResponseDTO[]>(`/events/by-date`, {
      eventDate: eventDateISO,
    });
    return EventMapper.entityFromJsonList(response);
  }

  /** GET /api/events/by-location?city=Leuven */
  async getEventsByLocation(city: string): Promise<EventItem[]> {
    const response = await this.api.get<EventResponseDTO[]>(`/events/by-location`, { city });
    return EventMapper.entityFromJsonList(response);
  }

  /** GET /api/events/{eventId}/participants */
  async getEventParticipants(eventId: string): Promise<EventParticipantResponseDTO[]> {
    return this.api.get<EventParticipantResponseDTO[]>(`/events/${eventId}/participants`);
  }

  /** POST /api/events (auth) */
  async createEvent(request: EventRequestDTO): Promise<EventItem> {
    const response = await this.api.post<EventResponseDTO>(`/events`, request);
    return EventMapper.entityFromJson(response);
  }

  /** POST /api/events/participants/{participantId} (auth) */
  async subscribeToEvent(participantId: string): Promise<EventParticipantResponseDTO> {
    return this.api.post<EventParticipantResponseDTO>(
      `/events/participants/${participantId}`,
      undefined,
      true
    );
  }

  /** PUT /api/events/{eventId} (auth) */
  async updateEvent(eventId: string, request: EventRequestDTO): Promise<EventItem> {
    const response = await this.api.put<EventResponseDTO>(`/events/${eventId}`, request, true);
    return EventMapper.entityFromJson(response);
  }

  /** DELETE /api/events/{eventId} (auth) */
  async deleteEvent(eventId: string): Promise<void> {
    await this.api.delete<void>(`/events/${eventId}`, true);
  }

  /** DELETE /api/events/{eventId}/participants (auth) */
  async cancelEventSubscription(eventId: string): Promise<void> {
    await this.api.delete<void>(`/events/${eventId}/participants`, true);
  }
}
