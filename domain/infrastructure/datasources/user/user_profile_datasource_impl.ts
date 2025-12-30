import { UserProfileDataSource } from "@/domain/datasources/user/user_profile_datasource";
import { mapProfileToFrontend } from "@/domain/infrastructure/mappers/user_profile_mapper";
import { UserProfileResponseDTO } from "@/domain/model/dto/user/user_profile_response_dto";
import { UserProfileUpdateRequest } from "@/domain/model/dto/user/user_profile_update_request";
import { UserProfile } from "@/domain/model/entities/events/user_profile";
import { ApiService } from "@/domain/services/api_service";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { AxiosError } from "axios";

/**
 * Remote implementation of UserProfileDataSource using ApiService.
 */
export class UserProfileDataSourceImpl implements UserProfileDataSource {
  constructor(private readonly api: ApiService) {}

  private getCurrentUsername(): string {
    const user = useUserAuthStore.getState().user;
    if (!user?.username) {
      throw new Error("No username found for current user");
    }
    return user.username;
  }

  async getMyProfile(): Promise<UserProfile> {
    const username = this.getCurrentUsername();
    try {
      const dto = await this.api.get<UserProfileResponseDTO>(
        `/user/username/${username}`
      );
      return mapProfileToFrontend(dto);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      // If the backend returns 404, it means the user has no profile yet.
      // Return an empty profile so the UI can render placeholders instead of failing.
      if (status === 404) {
        const emptyProfile: UserProfile = {
          id: "no-profile-id",
          name: username,
          age: 0,
          bio: "",
          nationality: [],
          languages: [],
          interests: [],
          city: "",
          country: "",
          profileImage: null,
          socialMedia: null,
        };
        return emptyProfile;
      }

      throw error;
    }
  }

  async updateMyProfile(userProfileId: string, payload: UserProfileUpdateRequest): Promise<UserProfile> {
    const dto = await this.api.put<UserProfileResponseDTO>(
      `/user/${userProfileId}`,
      payload,
      true
    );
    return mapProfileToFrontend(dto);
  }
}

