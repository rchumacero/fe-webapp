import { createApiClient } from "@kplian/infrastructure";
import { VendorProfileRepository } from "../../domain/repositories/VendorProfileRepository";
import { VendorProfile, UpdateVendorProfileDTO } from "../../domain/entities/VendorProfile";

const apiClient = createApiClient('crm');
const BASE_ROUTE = '/v1/vendor-profiles';

export class VendorProfileRepositoryImpl implements VendorProfileRepository {
  async getByPersonId(personId: string): Promise<VendorProfile | null> {
    try {
      const response = await apiClient.get<VendorProfile>(`${BASE_ROUTE}/by-person/${personId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  async save(profile: VendorProfile): Promise<VendorProfile> {
    const response = await apiClient.post<VendorProfile>(BASE_ROUTE, profile);
    return response.data;
  }

  async update(id: string, profile: UpdateVendorProfileDTO): Promise<VendorProfile> {
    const response = await apiClient.patch<VendorProfile>(`${BASE_ROUTE}/${id}`, profile);
    return response.data;
  }
}
