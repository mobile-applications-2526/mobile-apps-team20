// src/domain/datasources/event_datasource_impl.ts
import { EventDataSource } from "@/domain/datasources/events/event_datasource";

import { EventItem } from "@/domain/model/entities/events/event_item";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import type { ApiService } from "@/domain/services/api_service";
import { EventResponseDTO } from "@/domain/model/dto/events/event_response_dto";
import { EventParticipantResponseDTO } from "@/domain/model/dto/events/event_participant_response_dto";
import { EventRequestDTO } from "@/domain/model/dto/events/event_request_dto";
import { mapEventToFrontend } from "../../mappers/event_mapper";
import { EventParticipant } from "@/domain/model/entities/events/event_participant";
import { mapParticipantToFrontend } from "../../mappers/event_participant_mapper";

export class EventDataSourceImpl implements EventDataSource {
  constructor(private readonly api: ApiService) {}

  /** GET /api/events/{eventId} */
  async getEventById(eventId: string): Promise<EventItem> {
    const response = await this.api.get<EventResponseDTO>(`/events/${eventId}`);
    return mapEventToFrontend(response);
  }

  /** GET /api/events/by-any-tag?tags=MUSIC&tags=SPORTS */
  async getEventsByAnyTag(tags: InterestTag[], page: number, size: number): Promise<EventItem[]> {
    const response = await this.api.get<EventResponseDTO[]>(`/events/by-any-tag`, {
      tags,
      page: page,
      size: size
    });
    return response.map((event) => mapEventToFrontend(event))
  }
  
  /** GET /api/events/by-date?eventDate=2025-10-15T00:00:00 */
  async getEventsByDateAscending(eventDateISO: string, page: number, size: number): Promise<EventItem[]> {
    const response = await this.api.get<EventResponseDTO[]>(`/events/by-date`, {
      eventDate: eventDateISO,
      page: page,
      size: size
    });
    return response.map((event) => mapEventToFrontend(event))
  }
  
  /** GET /api/events/by-location?city=Leuven */
  async getEventsByLocation(city: string, page: number, size: number): Promise<EventItem[]> {
    const response = await this.api.get<EventResponseDTO[]>(`/events/by-location`, {
      city,
      page: page,
      size: size
    });
    return response.map((event) => mapEventToFrontend(event))
  }
  
  /** GET /api/events/{eventId}/participants */
  async getEventParticipants(eventId: string, page: number, size: number): Promise<EventParticipant[]> {
    const response = await this.api.get<EventParticipantResponseDTO[]>(`/events/${eventId}/participants`, {
      page: page,
      size: size
    });
    return response.map((participant) => mapParticipantToFrontend(participant))
  }
  
  /** POST /api/events (auth) */
  async createEvent(request: EventRequestDTO): Promise<EventItem> {
    const response = await this.api.post<EventResponseDTO>(`/events`, request);
    return mapEventToFrontend(response);
  }

  /** POST /api/events/participants/{participantId} (auth) */
  async subscribeToEvent(participantId: string): Promise<EventParticipant> {
    const response = await this.api.post<EventParticipantResponseDTO>(
      `/events/participants/${participantId}`,
      undefined,
      true
    );
    return mapParticipantToFrontend(response)
  }

  /** PUT /api/events/{eventId} (auth) */
  async updateEvent(eventId: string, request: EventRequestDTO): Promise<EventItem> {
    const response = await this.api.put<EventResponseDTO>(`/events/${eventId}`, request, true);
    return mapEventToFrontend(response);
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
