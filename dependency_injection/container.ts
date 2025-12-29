import { AuthDataSourceImpl } from "@/domain/infrastructure/datasources/auth/auth_datasource_impl";
import { ChatDatasourceImpl } from "@/domain/infrastructure/datasources/chat/chat_datasource_impl";
import { EventDataSourceImpl } from "@/domain/infrastructure/datasources/events/event_datasource_impl";
import { UserProfileDataSourceImpl } from "@/domain/infrastructure/datasources/user/user_profile_datasource_impl";
import { AuthRepositoryImpl } from "@/domain/infrastructure/repositories/auth/auth_repository_impl";
import { ChatRepositoryImpl } from "@/domain/infrastructure/repositories/chat/chat_repository_impl";
import { EventRepositoryImpl } from "@/domain/infrastructure/repositories/events/event_repository_impl";
import { UserProfileRepositoryImpl } from "@/domain/infrastructure/repositories/user/user_profile_repository_impl";
import { ApiServiceImpl } from "@/domain/services_impl/api_service_impl";

// Container for dependency injection
const apiService = new ApiServiceImpl();
const eventDataSource = new EventDataSourceImpl(apiService);
const chatDataSource = new ChatDatasourceImpl(apiService);
const userProfileDataSource = new UserProfileDataSourceImpl(apiService);

const eventRepository = new EventRepositoryImpl(eventDataSource);
const chatRepository = new ChatRepositoryImpl(chatDataSource);
const userProfileRepository = new UserProfileRepositoryImpl(userProfileDataSource);

// Auth
const authDataSource = new AuthDataSourceImpl(apiService);
const authRepository = new AuthRepositoryImpl(authDataSource);

export const container = {
  apiService,
  eventDataSource,
  eventRepository,
  authRepository,
  chatRepository,
  userProfileRepository,
};

