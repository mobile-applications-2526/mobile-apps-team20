import { UserProfile } from "@/domain/model/entities/events/user_profile";

export interface UserProfileRepository {
  getMyProfile(): Promise<UserProfile>;
}
