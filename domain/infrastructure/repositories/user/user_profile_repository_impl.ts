import { UserProfileDataSource } from "@/domain/datasources/user/user_profile_datasource";
import { UserProfile } from "@/domain/model/entities/events/user_profile";
import { UserProfileRepository } from "@/domain/repository/user/user_profile_repository";

export class UserProfileRepositoryImpl implements UserProfileRepository {
  constructor(private readonly dataSource: UserProfileDataSource) {}

  async getMyProfile(): Promise<UserProfile> {
    return this.dataSource.getMyProfile();
  }
}
