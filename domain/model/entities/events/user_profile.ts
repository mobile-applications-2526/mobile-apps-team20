import { InterestTag } from "../../enums/interest_tag"

export interface UserProfile {
    id: string
    name: string
    age: number
    bio: string
    nationality: string[]
    languages: string[]
    interests: InterestTag[]
    city: string
    country: string
    profileImage: string | null
    socialMedia: Map<string, string> | null
}