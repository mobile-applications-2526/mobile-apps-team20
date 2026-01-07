
import { container } from "@/dependency_injection/container";
import { getErrorMessage } from "@/shared/utils/error_utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { UserAuthRequest } from "@/domain/model/dto/auth/user_auth_request";
import { UserAuthResponse } from "@/domain/model/dto/auth/user_auth_response";
import { User } from "@/domain/model/entities/users/user";
import { AuthStatus } from "@/domain/model/enums/AuthStatus";
import { StorageType } from "@/domain/model/enums/storage_type";
import { UserSessionCredentials } from "@/domain/model/dto/auth/user_session_credentials";

interface UserAuthStore {
  user: User | null;
  authStatus: AuthStatus;
  accessToken: string | null;

  errorLogin: string | null;
  isLoginLoading: boolean;

  errorExternalLogin: string | null;
  isExternalLoginLoading: boolean;

  errorRegister: string | null;
  isRegisterLoading: boolean;

  errorCode: string | null
  isLoadingCode: boolean

  setUser: (user: User) => void;
  setAuthStatus: (status: AuthStatus) => void;
  setLoginError: (message: string | null) => void;
  setCodeError: (message: string | null) => void;
  setAccessToken: (token: string | null) => void
  clearUser: () => Promise<void>;

  initializeSession: () => void;
  requestExternalLogin: (idToken: string) => Promise<boolean>;
  requestLoginEmail: (email: string) => Promise<boolean>;
  verifyEmailCode: (code: string) => Promise<boolean>;
  register: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUserAuthenticated: (resp: UserAuthResponse) => Promise<void>;
}

export const useUserAuthStore = create<UserAuthStore>((set, get) => ({
  user: null,
  authStatus: AuthStatus.CHECKING,
  accessToken: null,
  
  errorLogin: null,
  isLoginLoading: false,

  errorExternalLogin: null,
  isExternalLoginLoading: false,

  errorCode: null,
  isLoadingCode: false,

  errorRegister: null,
  isRegisterLoading: false,

  setUser: (user: User) => set({ user }),
  setAuthStatus: (status: AuthStatus) => set({ authStatus: status }),
  setLoginError: (message: string | null) => set({ errorLogin: message }),
  setCodeError: (message: string | null) => set({ errorCode: message }),
  setAccessToken: (token: string | null) => set({ accessToken: token }),
  

  clearUser: async () => {
    // Remove tokens and reset user/auth state
    await AsyncStorage.multiRemove([
      StorageType.ACCESS_TOKEN,
      StorageType.REFRESH_TOKEN,
      StorageType.USER_CREDENTIALS
    ]);
    set({ 
      user: null,
      authStatus: AuthStatus.NOT_AUTHENTICATED, 
      errorLogin: null,
      errorCode: null,
      errorExternalLogin: null,
      errorRegister: null,
      accessToken: null
    });
  },

  initializeSession: async () => {
    const state = get()

    try {
      // Assure the status is checking
      set({ authStatus: AuthStatus.CHECKING });

      // TODO: Cache the user profile (save it when filling it)
      const token = await AsyncStorage.getItem(StorageType.ACCESS_TOKEN);
      const json = await AsyncStorage.getItem(StorageType.USER_CREDENTIALS);
      
      if (token && json) {
        
        const credentials: UserSessionCredentials = JSON.parse(json)
        state.setAccessToken(token)

        // Restore the session
        // TODO: Fetch user & profile data from backend
        set({ 
            authStatus: AuthStatus.AUTHENTICATED,
            user: new User(
              credentials.email,
              credentials.username
            ) 
        });

      } else {

        set({ authStatus: AuthStatus.NOT_AUTHENTICATED });
        state.clearUser()
        
      }
    } catch (error) {

      set({ authStatus: AuthStatus.NOT_AUTHENTICATED });

      state.clearUser()
    }
  },


  requestExternalLogin: async (idToken: string) => {

    if (idToken.trim().length === 0) return false

    const state = get()
    
    if (state.isExternalLoginLoading) {
      set({ errorExternalLogin: "Request already in process" })
      return false
    }

    set({ isExternalLoginLoading: true, errorExternalLogin: null })

    // Validate the token with the backend
    try {

      // repo request
      const response = await container.authRepository.externalLogin({ token: idToken })
      state.setUserAuthenticated(response)

      set({ isExternalLoginLoading: false })
      return true

    } catch (error: unknown){

      set({
        errorExternalLogin: getErrorMessage(error),
        isExternalLoginLoading: false,
        authStatus: AuthStatus.NOT_AUTHENTICATED
      })

      return false
    }

  },

  /**
   * Starts email login by requesting a verification code.
   * Stores a temporary user with the email.
   */
  requestLoginEmail: async (email: string) => {
    const state = get();

    if (state.isLoginLoading) {
      state.setLoginError("Request already in process")
      return false
    }

    try {
      set({ isLoginLoading: true, errorLogin: null });

      const request: UserAuthRequest = { email };
      await container.authRepository.requestLoginEmail(request);

      state.setUser(new User(email, ""))
      set({ isLoginLoading: false })

      return true

    } catch (e: unknown) {
      set({ errorLogin: getErrorMessage(e), isLoginLoading: false });
      return false
    }
  },

  /**
   * Verifies the received code, persists tokens, and marks the user as AUTHENTICATED.
   */
  verifyEmailCode: async (code: string) => {

    const state = get()

    if (state.isLoadingCode) {
      state.setCodeError("Verification request already in process")
      return false
    }

    if (!state.user) {
      set({ errorCode: "No email found. Please restart login." });
      return false;
    }

    const email = state.user.email;

    try {
      set({ isLoadingCode: true, errorCode: null });

      const request: UserAuthRequest = { email };
      const resp: UserAuthResponse = await container
        .authRepository.verifyEmailCode(code, request);

      state.setUserAuthenticated(resp)

      set({ isLoadingCode: false })
      
      return true

    } catch (e: unknown) {
      set({ errorCode: getErrorMessage(e), isLoadingCode: false });
      return false
    } 

  },

  /**
   * Registers a new account. (Auth status transition depends on your flow.)
   */
  register: async (email: string) => {
    try {
      const state = get()

      if (state.isRegisterLoading) {
        set({ errorRegister: "Register request already in process" })
        return false
    }

      set({ isRegisterLoading: true, errorRegister: null });

      const request: UserAuthRequest = { email };
      await container.authRepository.register(request);

      set({ isRegisterLoading: false })

      return true

    } catch (e: unknown) {
      set({ errorRegister: getErrorMessage(e), isRegisterLoading: false });
      return false
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

  setUserAuthenticated: async (resp: UserAuthResponse) => {
    if (!resp?.accessToken || !resp?.refreshToken || !resp?.username) 
      throw new Error("Invalid auth response");

    const state = get()

    if (!state.user) {
      state.setUser(
        new User(
          resp.email,
          resp.username
        )
      )
    }

    else {
      state.setUser(
          state.user.copyWith({
          username: resp.username,
        })
      )
    }

    const credentials: UserSessionCredentials = {
      email: resp.email,
      username: resp.username
    }

    await Promise.all([
      AsyncStorage.setItem(StorageType.ACCESS_TOKEN, resp.accessToken),
      AsyncStorage.setItem(StorageType.REFRESH_TOKEN, resp.refreshToken),
      AsyncStorage.setItem(StorageType.USER_CREDENTIALS, JSON.stringify(credentials))
    ]);

    state.setAccessToken(resp.accessToken)

    set({
      authStatus: AuthStatus.AUTHENTICATED,
    });
  }
}));