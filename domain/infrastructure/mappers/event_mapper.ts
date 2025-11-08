import { EventFormData } from "@/components/events/event_form";
import { EventRequestDTO } from "@/domain/dto/event_request_dto";


export function mapFormToRequestDTO(form: EventFormData): EventRequestDTO {
  return {
    title: form.title.trim(),
    description: form.description?.trim() ?? "",
    image: form.image ?? undefined,
    interests: form.interests
      ? form.interests.split(",").map((i) => i.trim()) // convertir string "music,party" → ["music","party"]
      : [],
    city: form.city?.trim() ?? "",
    placeName: form.placeName?.trim() ?? "",
    startDate: form.startDate ?? "",
    endDate: form.endDate ?? "",
  };
}
