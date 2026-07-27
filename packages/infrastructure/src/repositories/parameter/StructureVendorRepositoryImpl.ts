import { createApiClient } from "../../api/client";
import { StructureVendor, CreateStructureVendorDto, UpdateStructureVendorDto, IStructureVendorRepository } from "@kplian/core";

export class StructureVendorRepositoryImpl implements IStructureVendorRepository {
  private api = createApiClient('parameter');

  async getAll(): Promise<StructureVendor[]> {
    const response = await this.api.get<StructureVendor[]>('/structure-vendor');
    return response.data || [];
  }

  async getById(id: number): Promise<StructureVendor> {
    const response = await this.api.get<StructureVendor>(`/structure-vendor/${id}`);
    return response.data;
  }

  async getByStructureId(structureId: number | string): Promise<StructureVendor[]> {
    const response = await this.api.post<StructureVendor[]>('/structure-vendor/batch', { structureId });
    return response.data || [];
  }

  async create(data: CreateStructureVendorDto): Promise<StructureVendor[]> {
    const response = await this.api.post<StructureVendor[]>('/structure-vendor/batch', data);
    return response.data || [];
  }

  async update(data: UpdateStructureVendorDto): Promise<StructureVendor> {
    const response = await this.api.put<StructureVendor>(`/structure-vendor/${data.id}`, data);
    return response.data;
  }

  async delete(id: number | string): Promise<void> {
    await this.api.delete(`/structure-vendor/${id}`);
  }
}
