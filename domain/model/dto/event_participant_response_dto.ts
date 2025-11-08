import { UserProfile } from "../entities/user_profile"

export interface EventParticipantResponseDTO {
    id: string
    userProfile: UserProfile
}