import { InterestTag } from "../enums/interest_tag"


export interface EventRequestDTO {
    title: string
    description: string
    image?: string
    interests: InterestTag[]   
    city: string
    placeName: string
    startDate: string
    endDate: string
}