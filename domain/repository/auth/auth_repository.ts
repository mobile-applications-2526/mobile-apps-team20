// src/domain/repository/auth_repository.ts
// Repository contract for authentication use cases.
// Repositories orchestrate one or more data sources and expose stable methods
// to the application layer (stores, use-cases, UI).

import { RefreshTokenRequest } from "@/domain/model/dto/auth/refresh_token_auth_request";
import { TokenRequest } from "@/domain/model/dto/auth/token_request";
import { UserAuthRequest } from "@/domain/model/dto/auth/user_auth_request";
import { UserAuthResponse } from "@/domain/model/dto/auth/user_auth_response";
import { UserProfileResponseDTO } from "@/domain/model/dto/user/user_profile_response_dto";
import { UserProfile } from "@/domain/model/entities/events/user_profile";


export interface AuthRepository {
  /**
   * Triggers the login flow (e.g., send verification code to email).
   */
  requestLoginEmail(request: UserAuthRequest): Promise<void>;

  // Login with google authentication
  externalLogin(request: TokenRequest): Promise<UserAuthResponse>;

  /**
   * Verifies the email code and retrieves tokens.
   */
  verifyEmailCode(
    code: string,
    request: UserAuthRequest
  ): Promise<UserAuthResponse>;

  /**
   * Registers a new user.
   */
  register(request: UserAuthRequest): Promise<void>;

  /**
   * Refreshes tokens using a refresh token.
   */
  refreshToken(request: RefreshTokenRequest): Promise<UserAuthResponse>;

  getAuthenticatedUser(request: string): Promise<UserProfile>;

  /**
   * Logs out from the current session on the server.
   */
  logout(): Promise<void>;
}
