// Auth store with proper loading management and clean async handling.
// - Uses AuthStatus enum instead of boolean isAuthenticated.
// - Each async action toggles `isLoading` automatically.
// - Errors are captured and stored (no rethrow).

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { container } from "@/dependency_injection/container";
import { getErrorMessage } from "@/shared/error_utils";

import { User } from "@/domain/model/entities/users/user";
import { UserAuthRequest } from "@/domain/model/dto/auth/user_auth_request";
import { RefreshTokenRequest } from "@/domain/model/dto/auth/refresh_token_auth_request";
import { AuthRepository } from "@/domain/repository/auth/auth_repository";
import { UserAuthResponse } from "@/domain/model/dto/auth/user_auth_response";
import { AuthStatus } from "@/domain/model/enums/AuthStatus";
import { StorageType } from "@/domain/model/enums/storage_type";

interface UserAuthStore {
  user: User | null;
  authStatus: AuthStatus;
  error: string | null;
  isLoading: boolean;

  authRepository: AuthRepository;

  setUser: (user: User) => void;
  setAuthStatus: (status: AuthStatus) => void;
  setError: (message: string | null) => void;
  clearUser: () => Promise<void>;

  requestLoginEmail: (email: string) => Promise<void>;
  verifyEmailCode: (code: string) => Promise<void>;
  register: (email: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserAuthStore = create<UserAuthStore>((set, get) => ({
  user: null,
  authStatus: AuthStatus.NOT_AUTHENTICATED,
  error: null,
  isLoading: false,

  authRepository: container.authRepository,

  setUser: (user: User) => set({ user }),
  setAuthStatus: (status: AuthStatus) => set({ authStatus: status }),
  setError: (message: string | null) => set({ error: message }),

  clearUser: async () => {
    // Remove tokens and reset user/auth state
    await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
    set({ user: null, authStatus: AuthStatus.NOT_AUTHENTICATED, error: null });
  },

  /**
   * Starts email login by requesting a verification code.
   * Stores a temporary user with the email.
   */
  requestLoginEmail: async (email: string) => {
    const { authRepository } = get();
    try {
      set({ isLoading: true, error: null });
      const request: UserAuthRequest = { email };
      await authRepository.requestLoginEmail(request);
      set({
        user: new User(email, ""), 
      });
    } catch (e: unknown) {
      set({ error: getErrorMessage(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Verifies the received code, persists tokens, and marks the user as AUTHENTICATED.
   */
  verifyEmailCode: async (code: string) => {
    const { authRepository } = get();
    const { user } = get();

    if (!user) {
      set({ error: "No email found. Please restart login." });
      return;
    }

    const email = user.email;

    try {
      set({ isLoading: true, error: null });

      const request: UserAuthRequest = { email };
      const resp: UserAuthResponse = await authRepository.verifyEmailCode(code, request);
      if (!resp?.accessToken || !resp?.refreshToken) throw new Error("Invalid auth response");

      await AsyncStorage.setItem(StorageType.ACCESS_TOKEN, resp.accessToken);
      await AsyncStorage.setItem(StorageType.REFRESH_TOKEN, resp.refreshToken);
      
     const resp1 = AsyncStorage.getItem(StorageType.ACCESS_TOKEN)
     const resp2 = AsyncStorage.getItem(StorageType.REFRESH_TOKEN)

      const authenticatedUser = user.copyWith({
        email,
        username: resp.email.split("@")[0],
      });

      set({
        user: authenticatedUser,
        authStatus: AuthStatus.AUTHENTICATED,
        error: null,
      });
    } catch (e: unknown) {
      set({ error: getErrorMessage(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Registers a new account. (Auth status transition depends on your flow.)
   */
  register: async (email: string) => {
    const { authRepository } = get();
    try {
      set({ isLoading: true, error: null });
      const request: UserAuthRequest = { email };
      await authRepository.register(request);
    } catch (e: unknown) {
      set({ error: getErrorMessage(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Silently refreshes tokens using the stored refresh token.
   * If anything is missing/fails, clears the session and resets auth state.
   */
  refreshToken: async () => {
    const { authRepository } = get();
    try {
      set({ isLoading: true, error: null });

      const refreshToken = await AsyncStorage.getItem(StorageType.REFRESH_TOKEN);
      const email = get().user?.email;

      if (!refreshToken || !email) {
        set({ error: "Missing refresh token or email." });
        await get().clearUser();
        return;
      }

      const request: RefreshTokenRequest = { refreshToken, email };
      const resp = await authRepository.refreshToken(request);

      await AsyncStorage.multiSet([
        ["accessToken", resp.accessToken],
        ["refreshToken", resp.refreshToken],
      ]);

      set({ authStatus: AuthStatus.AUTHENTICATED, error: null });
    } catch (e: unknown) {
      set({ error: getErrorMessage(e) });
      await get().clearUser();
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Logs out on the backend (best-effort) and always clears the local session.
   */
  logout: async () => {
    const { authRepository } = get();
    try {
      set({ isLoading: true, error: null });
      await authRepository.logout();
    } catch (e: unknown) {
      set({ error: getErrorMessage(e) });
    } finally {
      await get().clearUser();
      set({ isLoading: false });
    }
  },
}));
