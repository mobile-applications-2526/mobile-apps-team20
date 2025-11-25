
import { container } from "@/dependency_injection/container";
import { getErrorMessage } from "@/shared/utils/error_utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { UserAuthRequest } from "@/domain/model/dto/auth/user_auth_request";
import { UserAuthResponse } from "@/domain/model/dto/auth/user_auth_response";
import { User } from "@/domain/model/entities/users/user";
import { AuthStatus } from "@/domain/model/enums/AuthStatus";
import { StorageType } from "@/domain/model/enums/storage_type";

interface UserAuthStore {
  user: User | null;
  authStatus: AuthStatus;

  errorLogin: string | null;
  isLoginLoading: boolean;

  errorRegister: string | null;
  isRegisterLoading: boolean;

  errorCode: string | null
  isLoadingCode: boolean

  setUser: (user: User) => void;
  setAuthStatus: (status: AuthStatus) => void;
  setError: (message: string | null) => void;
  clearUser: () => Promise<void>;

  requestLoginEmail: (email: string) => Promise<void>;
  verifyEmailCode: (code: string) => Promise<void>;
  register: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserAuthStore = create<UserAuthStore>((set, get) => ({
  user: null,
  authStatus: AuthStatus.NOT_AUTHENTICATED,
  
  errorLogin: null,
  isLoginLoading: false,

  errorCode: null,
  isLoadingCode: false,

  errorRegister: null,
  isRegisterLoading: false,

  setUser: (user: User) => set({ user }),
  setAuthStatus: (status: AuthStatus) => set({ authStatus: status }),
  setError: (message: string | null) => set({ errorLogin: message }),

  clearUser: async () => {
    // Remove tokens and reset user/auth state
    await AsyncStorage.multiRemove([
      StorageType.ACCESS_TOKEN,
      StorageType.REFRESH_TOKEN,
      StorageType.USER_CREDENTIALS
    ]);
    set({ user: null, authStatus: AuthStatus.NOT_AUTHENTICATED, errorLogin: null });
  },

  /**
   * Starts email login by requesting a verification code.
   * Stores a temporary user with the email.
   */
  requestLoginEmail: async (email: string) => {
    const state = get();

    if (state.isLoginLoading) return

    try {
      set({ isLoginLoading: true, errorLogin: null });

      const request: UserAuthRequest = { email };
      await container.authRepository.requestLoginEmail(request);

      state.setUser(new User(email, ""))
      set({ isLoginLoading: false })

    } catch (e: unknown) {
      set({ errorLogin: getErrorMessage(e), isLoginLoading: false });
    }
  },

  /**
   * Verifies the received code, persists tokens, and marks the user as AUTHENTICATED.
   */
  verifyEmailCode: async (code: string) => {

    const state = get()

    if (state.isLoadingCode) return

    if (!state.user) {
      set({ errorCode: "No email found. Please restart login." });
      return;
    }

    const email = state.user.email;

    try {
      set({ isLoadingCode: true, errorCode: null });

      const request: UserAuthRequest = { email };
      const resp: UserAuthResponse = await container
        .authRepository.verifyEmailCode(code, request);
      
      if (!resp?.accessToken || !resp?.refreshToken) throw new Error("Invalid auth response");

      await AsyncStorage.setItem(StorageType.ACCESS_TOKEN, resp.accessToken);
      await AsyncStorage.setItem(StorageType.REFRESH_TOKEN, resp.refreshToken);
      await AsyncStorage.setItem(StorageType.USER_CREDENTIALS, resp.email)

      const authenticatedUser = state.user.copyWith({
        username: email.split("@")[0],
      });

      set({
        user: authenticatedUser,
        authStatus: AuthStatus.AUTHENTICATED,
        errorCode: null,
        isLoadingCode: false
      });

    } catch (e: unknown) {
      set({ errorCode: getErrorMessage(e), isLoadingCode: false });
    } 

  },

  /**
   * Registers a new account. (Auth status transition depends on your flow.)
   */
  register: async (email: string) => {
    try {
      set({ isLoginLoading: true, errorLogin: null });
      const request: UserAuthRequest = { email };
      await container.authRepository.register(request);
    } catch (e: unknown) {
      set({ errorLogin: getErrorMessage(e) });
    } finally {
      set({ isLoginLoading: false });
    }
  },

  /**
   * Logs out on the backend (best-effort) and always clears the local session.
   */
  logout: async () => {
    try {
      set({ isLoginLoading: true, errorLogin: null });

      await container.authRepository.logout();

      await get().clearUser();
      set({ isLoginLoading: false });

    } catch (e: unknown) {
      set({ errorLogin: getErrorMessage(e), isLoginLoading: false});
    }
  },
}));
