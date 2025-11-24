import { EventResponseDTO } from "@/domain/model/dto/events/event_response_dto";
import { mapProfileToFrontend, processImage } from "./user_profile_mapper";
import { EventItem } from "@/domain/model/entities/events/event_item";
import { EventOrganiser } from "@/domain/model/entities/events/event_organiser";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import { EventFormData } from "@/components/events/event_form";
import { EventRequestDTO } from "@/domain/model/dto/events/event_request_dto";


export const mapEventToFrontend = (dto: EventResponseDTO): EventItem => {
    
    let organiserMapped: EventOrganiser;

    if (dto.organiser) {
        organiserMapped = {
            id: dto.organiser.id ?? "no-id",
            profile: mapProfileToFrontend(dto.organiser.profile)  
        };
    } else {
        organiserMapped = {
            id: "no-organiser-data",
            profile: mapProfileToFrontend(dto.organiser)  
        };
    }

    return {
        id: dto.eventId,
        title: dto.name,
        description: dto.eventBio?.description ?? "",
        image: processImage(dto.eventBio?.image) || null,
        interests: (dto.eventBio?.interestTags ?? []) as InterestTag[],
        organiser: organiserMapped,
        participantCount: dto.participantCount ?? 0, 
        city: dto.location?.city ?? "Unknown City",
        placeName: dto.location?.placeName ?? "Unknown Place",
        chatId: dto.chat?.id ?? "no-chat-id",
        startDate: dto.startDate,
        endDate: dto.endDate
    };
};

export const mapEventFormToDTO = (formData: EventFormData): EventRequestDTO => {
  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    // If image is empty string, send undefined, otherwise trim it
    image: formData.image?.trim() ? formData.image.trim() : undefined,
    // Ensure interests is an array even if undefined in form
    interests: formData.interests ?? [], 
    city: formData.city.trim(),
    placeName: formData.placeName.trim(),
    startDate: formData.startDate,
    endDate: formData.endDate,
  };
};