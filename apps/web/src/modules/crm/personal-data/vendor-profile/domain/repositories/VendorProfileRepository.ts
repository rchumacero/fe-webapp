import { VendorProfile, UpdateVendorProfileDTO } from "../entities/VendorProfile";

export interface VendorProfileRepository {
  getByPersonId(personId: string): Promise<VendorProfile | null>;
  save(profile: VendorProfile): Promise<VendorProfile>;
  update(id: string, profile: UpdateVendorProfileDTO): Promise<VendorProfile>;
}
