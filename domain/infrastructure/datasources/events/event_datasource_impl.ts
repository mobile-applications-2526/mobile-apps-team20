// src/domain/datasources/event_datasource_impl.ts
import { EventDataSource } from "@/domain/datasources/events/event_datasource";

import { EventItem } from "@/domain/model/entities/events/event_item";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import type { ApiService } from "@/domain/services/api_service";
import { EventResponseDTO } from "@/domain/model/dto/events/event_response_dto";
import { EventParticipantResponseDTO } from "@/domain/model/dto/events/event_participant_response_dto";
import { mapEventToFrontend } from "../../mappers/event_mapper";
import { EventParticipant } from "@/domain/model/entities/events/event_participant";
import { mapParticipantToFrontend } from "../../mappers/event_participant_mapper";
import { PaginatedResponse } from "@/domain/model/shared/paginated_response";
import { EventListRestult } from "@/domain/model/dto/events/event_list_result";
import { EventParticipantListResult } from "@/domain/model/dto/events/event_participant_list_result";

export class EventDataSourceImpl implements EventDataSource {

  constructor(
    private readonly api: ApiService
  ) {
  }
  
  PAGE_SIZE = 10

  /**
   * Private helper to convert API PaginatedResponse to Domain EventListResult
   * Calculates 'hasMore' based on the 'last' property.
   */
  private fromPaginatedResponseToResult(response: PaginatedResponse<EventResponseDTO>): EventListRestult {
    return {
      events: response.content.map((event) => mapEventToFrontend(event)),
      hasMore: !response.last 
    };
  }

  /** GET /api/events/{eventId} */
  async getEventById(eventId: string): Promise<EventItem> {
    const response = await this.api.get<EventResponseDTO>(`/events/${eventId}`);
    return mapEventToFrontend(response);
  }

  /** GET /api/events/by-any-tag?tags=MUSIC&tags=SPORTS */
  async getEventsByAnyTag(tags: InterestTag[], page: number): Promise<EventListRestult> {
    const response = await this.api.get<PaginatedResponse<EventResponseDTO>>(`/events/by-any-tag`, {
      tags,
      page: page,
      size: this.PAGE_SIZE
    });
    return this.fromPaginatedResponseToResult(response)
  }
  
  /** GET /api/events/by-date?eventDate=2025-10-15T00:00:00 */
  async getEventsByDateAscending(eventDateISO: string, page: number): Promise<EventListRestult> {
    const response = await this.api.get<PaginatedResponse<EventResponseDTO>>(`/events/by-date`, {
      eventDate: eventDateISO,
      page: page,
      size: this.PAGE_SIZE
    });
    return this.fromPaginatedResponseToResult(response)
  }
  
  /** GET /api/events/by-location?city=Leuven */
  async getEventsByLocation(city: string, page: number): Promise<EventListRestult> {
    const response = await this.api.get<PaginatedResponse<EventResponseDTO>>(`/events/by-location`, {
      city,
      page: page,
      size: this.PAGE_SIZE
    });
    const last = response.last
    return this.fromPaginatedResponseToResult(response)
  }
  
  /** GET /api/events/{eventId}/participants */
  async getEventParticipants(eventId: string, page: number): Promise<EventParticipantListResult> {
    const response = await this.api.get<PaginatedResponse<EventParticipantResponseDTO>>(
      `/events/${eventId}/participants`, {
      page: page,
      size: this.PAGE_SIZE
    });
    return {
      participants: response.content.map((participant) => mapParticipantToFrontend(participant)),
      hasMore: !response.last
    }
  }

  async getEventsByDateAndTags(eventDateISO: string, tags: InterestTag[], page: number): Promise<EventListRestult> {
    const response = await this.api.get<PaginatedResponse<EventResponseDTO>>(`/events/by-date-and-interests`, {
      eventDate: eventDateISO,
      tags: tags,
      page: page,
      size: this.PAGE_SIZE
    });
    return this.fromPaginatedResponseToResult(response)
  }

  async getEventsByLocationAndTags(city: string, tags: InterestTag[], page: number): Promise<EventListRestult> {
    const response = await this.api.get<PaginatedResponse<EventResponseDTO>>(`/events/by-location-and-interests`, {
      city,
      tags: tags,
      page: page,
      size: this.PAGE_SIZE
    });
    return this.fromPaginatedResponseToResult(response)
  }
  
  /** POST /api/events (auth) */
  async createEvent(request: FormData): Promise<EventItem> {        
    const response = await this.api.post<EventResponseDTO>(`/events`, request);
    return mapEventToFrontend(response);
  }

  /** POST /api/events/participants/{eventId} (auth) */
  async subscribeToEvent(eventId: string): Promise<EventParticipant> {
    const response = await this.api.post<EventParticipantResponseDTO>(
      `/events/participants/${eventId}`,
      undefined,
      true
    );
    return mapParticipantToFrontend(response)
  }

  /** PUT /api/events/{eventId} (auth) */
  async updateEvent(eventId: string, request: FormData): Promise<EventItem> {
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