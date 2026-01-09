import { container } from "@/dependency_injection/container";
import { UserProfileUpdateRequest } from "@/domain/model/dto/user/user_profile_update_request";
import { UserProfile } from "@/domain/model/entities/events/user_profile";
import { getErrorMessage } from "@/shared/utils/error_utils";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { create } from "zustand";

interface UserProfileStore {
  // --- Authenticated User State ---
  /** The profile of the currently logged-in user. */
  profile: UserProfile | null;
  /** Loading state for operations related to the logged-in user (fetch/update). */
  isLoading: boolean;

  // --- Public User State (View Mode) ---
  /** The profile of another user currently being viewed. */
  publicProfile: UserProfile | null;
  /** Loading state specifically for fetching a public user by ID. */
  isPublicLoading: boolean;

  // --- Shared State ---
  error: string | null;

  // --- Actions for Authenticated User ---
  fetchProfile: () => Promise<void>;
  updateProfile: (payload: FormData | UserProfileUpdateRequest) => Promise<void>;
  
  // --- Actions for Public User ---
  /** Fetches a user profile by ID for read-only display. */
  fetchUserById: (id: string) => Promise<void>;
  /** Resets the public profile state (useful when unmounting the details screen). */
  clearPublicProfile: () => void;

  /** Clears all profile data (e.g., on logout). */
  clearStore: () => void;
}

// Inject dependency
const userProfileRepository = container.userProfileRepository;

export const useUserProfileStore = create<UserProfileStore>((set, get) => ({
  // Initial State
  profile: null,
  isLoading: false,
  publicProfile: null,
  isPublicLoading: false,
  error: null,

  // --------------------------------------------------------------------------
  // Authenticated User Operations
  // --------------------------------------------------------------------------

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await userProfileRepository.getMyProfile();
      set({ profile, isLoading: false });
    } catch (e: unknown) {
      // In production, you might want to log this to a monitoring service (e.g., Sentry)
      console.error("[UserProfileStore] Failed to fetch my profile:", e);
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },

  updateProfile: async (payload: FormData | UserProfileUpdateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const current = get().profile;

      let userProfileId: string;

      // Determine the ID to update. 
      // Ideally, the backend knows who 'me' is via the token, 
      // but if the repo requires an ID, we extract it here.
      if (current && current.id && current.id !== "no-profile-id") {
        userProfileId = current.id;
      } else {
        const authUser = useUserAuthStore.getState().user;
        if (!authUser) {
          throw new Error("Cannot update profile: no user logged in.");
        }
        // Fallback strategy for new users without a profile ID yet
        userProfileId = authUser.username || authUser.email;
      }

      const profile = await userProfileRepository.updateMyProfile(userProfileId, payload);
      
      // Update local state immediately to reflect changes in UI
      set({ profile, isLoading: false });
    } catch (e: unknown) {
      console.error("[UserProfileStore] Failed to update profile:", e);
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },

  // --------------------------------------------------------------------------
  // Public User Operations (Read-Only)
  // --------------------------------------------------------------------------

  fetchUserById: async (id: string) => {
    // We use a separate loading flag to avoid UI flickering on the 'My Profile' tab
    set({ isPublicLoading: true, error: null, publicProfile: null });
    try {
      const fetchedUser = await userProfileRepository.fetchUserById(id);
      set({ publicProfile: fetchedUser, isPublicLoading: false });
    } catch (e: unknown) {
      console.error(`[UserProfileStore] Failed to fetch user with ID ${id}:`, e);
      set({ error: getErrorMessage(e), isPublicLoading: false });
    }
  },

  clearPublicProfile: () => {
    set({ publicProfile: null, isPublicLoading: false, error: null });
  },

  // --------------------------------------------------------------------------
  // General Cleanup
  // --------------------------------------------------------------------------

  clearStore: () => {
    set({ 
      profile: null, 
      publicProfile: null, 
      error: null, 
      isLoading: false, 
      isPublicLoading: false 
    });
  },
}));