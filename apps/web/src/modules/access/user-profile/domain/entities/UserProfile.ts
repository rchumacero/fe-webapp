export interface UserProfile {
  id: string;
  userCode: string;
  profileId: string;
  validFrom: string; // Format: "YYYY-MM-DD"
  validTo?: string | null;
}

export interface CreateUserProfileDto {
  userCode: string;
  profileId: string;
  validFrom: string;
  validTo?: string | null;
}

export interface UpdateUserProfileDto {
  userCode: string;
  profileId: string;
  validFrom: string;
  validTo?: string | null;
}
