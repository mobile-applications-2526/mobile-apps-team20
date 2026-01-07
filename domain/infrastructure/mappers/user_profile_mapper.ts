import { UserProfileResponseDTO } from "@/domain/model/dto/user/user_profile_response_dto";
import { UserProfile } from "@/domain/model/entities/events/user_profile";
import { InterestTag } from "@/domain/model/enums/interest_tag";

// Static files are served from /api/uploads/{filename} on the same host
// as EXPO_PUBLIC_API_URL, so we append "/api" here.
const STATIC_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080"}/api`;

// Generic event/user images (existing behaviour, used by events)
export const processImage = (imageName: string | null | undefined): string | null => {
  if (!imageName) return null;

  // If it's already a complete URL (e.g. from Google or external), return it
  if (imageName.startsWith("http") || imageName.startsWith("https")) {
    return imageName;
  }

  // Images are exposed as /api/uploads/{filename}
  return `${STATIC_BASE_URL}/uploads/${imageName}`;
};

// Specific helper for profile pictures, which live under /uploads/profiles/{fileName}
export const processProfileImage = (imageName: string | null | undefined): string | null => {
  if (!imageName) return null;

  if (imageName.startsWith("http") || imageName.startsWith("https")) {
    return imageName;
  }

  // Profile pictures are exposed as /api/uploads/profiles/{filename}
  return `${STATIC_BASE_URL}/uploads/profiles/${imageName}`;
};

const DEFAULT_PROFILE: UserProfile = {
    id: "no-profile-id",
    name: "Unknown profile",
    age: 0,
    bio: "",
    nationality: [],
    languages: [],
    interests: [],
    city: "",
    country: "",
    profileImage: null,
    socialMedia: null,
};
/**
 * Helper to map the generic UserProfileDTO to the Frontend UserProfile interface.
 * Used for both Organisers and Participants.
 */
export function mapProfileToFrontend(dto: UserProfileResponseDTO): UserProfile {
    if (!dto) return DEFAULT_PROFILE;

    return {
        id: dto.id,
        name: dto.userName ?? "Anonymous", 
        
        age: dto.age ?? 0,
        bio: dto.bio ?? "",
        nationality: dto.nationality ? [dto.nationality] : [],
        languages: dto.languages ?? [],
        
        interests: (dto.interests ?? []) as InterestTag[], 
        
        city: dto.userLocation?.city ?? "",     
        country: dto.userLocation?.country ?? "",
        
        // Profile pictures are served from /uploads/profiles/{profilePicture}
        profileImage: processProfileImage(dto.profilePicture),
        socialMedia: dto.socialMedia
          ? new Map(Object.entries(dto.socialMedia))
          : null,
    };
};