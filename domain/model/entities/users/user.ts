/**
 * Represents an application user with optional profile information.
 * Designed as an immutable data class with a `copyWith` helper.
 */
export class User {
  constructor(
    public email: string,
    public username: string,
    public bio?: string,
    public profileImage?: string,
    public languages?: string[],
    public nationality?: string[],
    public socialMedia?: Map<string, string>
  ) {}

  /**
   * Returns a new `User` instance with updated fields.
   * Any field not provided in `changes` will retain its current value.
   */
  copyWith(changes: Partial<User>): User {
    return new User(
      changes.email ?? this.email,
      changes.username ?? this.username,
      changes.bio ?? this.bio,
      changes.profileImage ?? this.profileImage,
      changes.languages ?? this.languages,
      changes.nationality ?? this.nationality,
      changes.socialMedia ?? this.socialMedia
    );
  }

  /**
   * Converts the user into a plain JSON object for serialization.
   * Useful when storing the user in AsyncStorage or sending to APIs.
   */
  toJSON(): Record<string, any> {
    return {
      email: this.email,
      username: this.username,
      bio: this.bio,
      profileImage: this.profileImage,
      languages: this.languages,
      nacionality: this.nationality,
      // Convert Map to regular object for JSON safety
      socialMedia: this.socialMedia
        ? Object.fromEntries(this.socialMedia)
        : undefined,
    };
  }

  /**
   * Creates a new `User` instance from a plain object or JSON.
   */
  static fromJSON(json: any): User {
    return new User(
      json.email,
      json.username,
      json.bio,
      json.profileImage,
      json.languages,
      json.nacionality,
      json.socialMedia
        ? new Map(Object.entries(json.socialMedia))
        : undefined
    );
  }
}