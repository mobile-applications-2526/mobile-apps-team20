// src/domain/infrastructure/datasource/auth_remote_data_source.ts
// Remote implementation of AuthDataSource using the project's ApiService.
// This layer is responsible for building endpoints and passing the correct auth flag.
// Do not add domain logic here.

import { AuthDataSource } from "@/domain/datasources/auth/auth_datasource";
import { TokenRequest } from "@/domain/model/dto/auth/token_request";
import { RefreshTokenRequest } from "../../../model/dto/auth/refresh_token_auth_request";
import { UserAuthRequest } from "../../../model/dto/auth/user_auth_request";
import { UserAuthResponse } from "../../../model/dto/auth/user_auth_response";
import { ApiService } from "../../../services/api_service";
import { UserProfile } from "@/domain/model/entities/events/user_profile";
import { UserProfileResponseDTO } from "@/domain/model/dto/user/user_profile_response_dto";
import { mapProfileToFrontend } from "../../mappers/user_profile_mapper";

export class AuthDataSourceImpl implements AuthDataSource {
  constructor(private readonly api: ApiService) {}

  getAuthenticatedUser(request: string): Promise<UserProfile> {
    const response = this.api.get<UserProfileResponseDTO>("/api/user/" + request)
    console.log("Response DTO:", JSON.stringify(response));
    return response.then(dto => mapProfileToFrontend(dto))
  }

  login(request: UserAuthRequest): Promise<void> {
    // Public endpoint: do not attach Authorization header.
    return this.api.post<void>("/auth/login", request, /* auth */ false);
  }

  async googleLogin(request: TokenRequest): Promise<UserAuthResponse> {
    return this.api.post<UserAuthResponse>("/auth/google", request, /* auth */ false);
  }

  validateEmailCode(
    verificationCode: string,
    request: UserAuthRequest
  ): Promise<UserAuthResponse> {
    // Controller expects query param + request body.
    const endpoint = `/auth/validate-code?verificationCode=${encodeURIComponent(
      verificationCode
    )}`;
    return this.api.post<UserAuthResponse>(endpoint, request, /* auth */ false);
  }

  register(request: UserAuthRequest): Promise<void> {
    // Public endpoint.
    return this.api.post<void>("/auth/register", request, /* auth */ false);
  }

  refreshToken(request: RefreshTokenRequest): Promise<UserAuthResponse> {
    // Refresh typically does not use the current access token.
    return this.api.post<UserAuthResponse>(
      "/auth/refresh-token",
      request,
      /* auth */ false
    );
  }

  logout(): Promise<void> {
    // Protected endpoint: attach Authorization header.
    return this.api.post<void>("/auth/logout", {}, /* auth */ true);
  }
}
