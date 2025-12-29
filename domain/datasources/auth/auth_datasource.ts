  // src/domain/datasource/auth_data_source.ts
// Contract for remote/local data providers of authentication features.
// Implementations should only handle transport concerns (HTTP, storage, etc.)
// and return raw DTOs without domain logic.

import { RefreshTokenRequest } from "@/domain/model/dto/auth/refresh_token_auth_request";
import { TokenRequest } from "@/domain/model/dto/auth/token_request";
import { UserAuthRequest } from "@/domain/model/dto/auth/user_auth_request";
import { UserAuthResponse } from "@/domain/model/dto/auth/user_auth_response";
import { UserProfileResponseDTO } from "@/domain/model/dto/user/user_profile_response_dto";
import { UserProfile } from "@/domain/model/entities/events/user_profile";



export interface AuthDataSource {
  /**
   * Initiates the login flow.
   * Backend sends an email with a verification code if the email exists.
   * @returns A plain string as returned by the server (e.g., status/trace message).
   */
  login(request: UserAuthRequest): Promise<void>;

  /**
   * Authenticates via Google OAuth2.
   * Sends the Google ID Token to the backend to verify and retrieve app tokens.
   */
  googleLogin(request: TokenRequest): Promise<UserAuthResponse>;

  /**
   * Validates the email verification code and issues tokens.
   * @returns UserAuthResponse containing access/refresh tokens and related data.
   */
  validateEmailCode(
    verificationCode: string,
    request: UserAuthRequest
  ): Promise<UserAuthResponse>;

  /**
   * Registers a new user and triggers an activation email flow.
   */
  register(request: UserAuthRequest): Promise<void>;

  /**
   * Exchanges a refresh token for a new access/refresh token pair.
   */
  refreshToken(request: RefreshTokenRequest): Promise<UserAuthResponse>;

  getAuthenticatedUser(request: string ): Promise<UserProfile>;

  /**
   * Invalidates the current session on the server (access & refresh tokens).
   */
  logout(): Promise<void>;
}
