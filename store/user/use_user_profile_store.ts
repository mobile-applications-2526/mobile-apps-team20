import { container } from "@/dependency_injection/container";
import { UserProfileUpdateRequest } from "@/domain/model/dto/user/user_profile_update_request";
import { UserProfile } from "@/domain/model/entities/events/user_profile";
import { getErrorMessage } from "@/shared/utils/error_utils";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { create } from "zustand";

interface UserProfileStore {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (payload: UserProfileUpdateRequest) => Promise<void>;
  clearProfile: () => void;
}

const userProfileRepository = container.userProfileRepository;

export const useUserProfileStore = create<UserProfileStore>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await userProfileRepository.getMyProfile();
      set({ profile, isLoading: false });
    } catch (e: unknown) {
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },
  updateProfile: async (payload: UserProfileUpdateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const current = get().profile;

      let userProfileId: string;
      if (current && current.id && current.id !== "no-profile-id") {
        userProfileId = current.id;
      } else {
        const authUser = useUserAuthStore.getState().user;
        if (!authUser) {
          throw new Error("Cannot update profile: no user logged in");
        }
        // Fallback: use username (or email) as identifier when no profile exists yet
        userProfileId = authUser.username || authUser.email;
      }

      const profile = await userProfileRepository.updateMyProfile(userProfileId, payload);
      set({ profile, isLoading: false });
    } catch (e: unknown) {
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },
  clearProfile: () => {
    set({ profile: null, error: null, isLoading: false });
  },
}));

