export interface VendorProfile {
  id?: string;
  personId: string;
  logo?: string;
  description?: string;
  timezone: string;
  language: string;
  theme: string;
  primaryColour?: string;
  secondaryColour?: string;
  tertiaryColour?: string;
  url?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export interface CreateVendorProfileDTO extends Omit<VendorProfile, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> {}
export interface UpdateVendorProfileDTO extends Partial<CreateVendorProfileDTO> {}
