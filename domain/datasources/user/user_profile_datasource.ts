import { UserProfileUpdateRequest } from "@/domain/model/dto/user/user_profile_update_request";
import { UserProfile } from "@/domain/model/entities/events/user_profile";

/**
 * Remote DataSource contract for the authenticated user's profile.
 */
export interface UserProfileDataSource {
  /** GET /api/user/me/profile (or equivalent) */
  getMyProfile(): Promise<UserProfile>;

  /** PUT /api/user/me */
  updateMyProfile(
    userProfileId: string,
    payload: FormData | UserProfileUpdateRequest
  ): Promise<UserProfile>;

  /** * GET /api/users/{id} 
   */
  getUserById(id: string): Promise<UserProfile>;
}

