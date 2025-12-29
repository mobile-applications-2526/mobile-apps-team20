import { container } from "@/dependency_injection/container";
import { UserProfile } from "@/domain/model/entities/events/user_profile";
import { getErrorMessage } from "@/shared/utils/error_utils";
import { create } from "zustand";

interface UserProfileStore {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
}

const userProfileRepository = container.userProfileRepository;

export const useUserProfileStore = create<UserProfileStore>((set) => ({
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
}));
