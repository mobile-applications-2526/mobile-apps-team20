import { UserProfileUpdateRequest } from "@/domain/model/dto/user/user_profile_update_request";
import { UserProfile } from "@/domain/model/entities/events/user_profile";

export interface UserProfileRepository {
  getMyProfile(): Promise<UserProfile>;
  updateMyProfile(
    userProfileId: string,
    payload: FormData | UserProfileUpdateRequest
  ): Promise<UserProfile>;
  fetchUserById(id: string): Promise<UserProfile>;
}


