import { EventRequestDTO } from "@/domain/model/dto/event_request_dto";
import { EventResponseDTO } from "@/domain/model/dto/event_response_dto";
import { EventItem } from "@/domain/model/entities/event_item";

/**
 * Utility class for mapping between Event DTOs and domain entities.
 */
export class EventMapper {

  static toEntity(dto: EventResponseDTO): EventItem {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      image: dto.image,
      interests: dto.interests,
      organiserName: dto.organiser?.name ?? "Unknown organiser",
      city: dto.city,
      placeName: dto.placeName,
      chatId: dto.chatId,
      startDate: dto.startDate,
      endDate: dto.endDate,
    };
  }

  /**
   * Converts a list of EventResponseDTO → EventItem[]
   */
  static toEntityList(dtos: EventResponseDTO[]): EventItem[] {
    return dtos.map((dto) => this.toEntity(dto));
  }

  /**
   * Converts a single EventItem (frontend) → EventResponseDTO (for sending to backend or cache)
   */
  static toDTO(entity: EventItem): EventRequestDTO {
    return {
      title: entity.title,
      description: entity.description,
      image: entity.image,
      interests: entity.interests,
      city: entity.city,
      placeName: entity.placeName,
      startDate: entity.startDate,
      endDate: entity.endDate,
    };
  }

  /**
   * Converts a list of EventItem → EventResponseDTO[]
   */
  static toDTOList(entities: EventItem[]): EventRequestDTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }
}
