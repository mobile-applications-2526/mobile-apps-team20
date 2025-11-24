import { EventResponseDTO } from "@/domain/model/dto/events/event_response_dto";
import { mapProfileToFrontend, processImage } from "./user_profile_mapper";
import { EventItem } from "@/domain/model/entities/events/event_item";
import { EventOrganiser } from "@/domain/model/entities/events/event_organiser";
import { InterestTag } from "@/domain/model/enums/interest_tag";


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