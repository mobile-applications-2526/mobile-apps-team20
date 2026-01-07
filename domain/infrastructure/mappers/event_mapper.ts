import { EventFormData } from "@/components/events/event_form";
import { EventRequestDTO } from "@/domain/model/dto/events/event_request_dto";
import { EventResponseDTO } from "@/domain/model/dto/events/event_response_dto";
import { EventItem } from "@/domain/model/entities/events/event_item";
import { EventOrganiser } from "@/domain/model/entities/events/event_organiser";
import { mapProfileToFrontend, processImage } from "./user_profile_mapper";

// --- Helper: Fix Timezone Shift ---
// Converts "2023-11-18T10:00:00.000Z" (UTC) back to "2023-11-18T11:00:00" (Local Time)
// This ensures the backend receives the exact time the user selected on their clock.
const toLocalISOString = (isoString: string): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    // Shift time by the timezone offset to get the correct local representation
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    // Return ISO string without the 'Z' at the end
    return localDate.toISOString().slice(0, -1); 
};

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
        interests: (dto.eventBio?.interestTags ?? []),
        organiser: organiserMapped,
        participantCount: dto.participantCount ?? 0, 
        city: dto.location?.city ?? "Unknown City",
        placeName: dto.location?.placeName ?? "Unknown Place",
        startDate: dto.startDate,
        endDate: dto.endDate
    };
};

export const mapEventFormToDTO = (formData: EventFormData): EventRequestDTO => {
  return {
        name: formData.title.trim(),
        eventBio: {
            description: formData.description.trim(),
            image: null,
            interestTags: formData.interests ?? [],
        },
        location: {
            city: formData.city.trim(),
            placeName: formData.placeName.trim(),
        },
        startDate: toLocalISOString(formData.startDate), 
        endDate: toLocalISOString(formData.endDate),
  };
};