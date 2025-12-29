import { UserProfile } from "@/domain/model/entities/events/user_profile";

/**
 * Remote DataSource contract for the authenticated user's profile.
 */
export interface UserProfileDataSource {
  /** GET /api/user/me/profile (or equivalent) */
  getMyProfile(): Promise<UserProfile>;
}
