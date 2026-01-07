import { UserProfileDataSource } from "@/domain/datasources/user/user_profile_datasource";
import { UserProfileUpdateRequest } from "@/domain/model/dto/user/user_profile_update_request";
import { UserProfile } from "@/domain/model/entities/events/user_profile";
import { UserProfileRepository } from "@/domain/repository/user/user_profile_repository";

export class UserProfileRepositoryImpl implements UserProfileRepository {

  constructor(private readonly dataSource: UserProfileDataSource) {}

  async getMyProfile(): Promise<UserProfile> {
    return this.dataSource.getMyProfile();
  }

  async updateMyProfile(
    userProfileId: string,
    payload: FormData | UserProfileUpdateRequest
  ): Promise<UserProfile> {
    return this.dataSource.updateMyProfile(userProfileId, payload);
  }

  fetchUserById(id: string): Promise<UserProfile> {
    return this.dataSource.getUserById(id);
  }
}

