import { createApiClient } from "../../api/client";
import { Structure, CreateStructureDto, UpdateStructureDto, IStructureRepository } from "@kplian/core";

export class StructureRepositoryImpl implements IStructureRepository {
  private api = createApiClient('parameter');

  async getAll(): Promise<Structure[]> {
    const response = await this.api.get<Structure[]>('/structure');
    return response.data || [];
  }

  async getById(id: number | string): Promise<Structure> {
    const response = await this.api.get<Structure>(`/structure/${id}`);
    return response.data;
  }

  async getByCode(code: string): Promise<Structure> {
    const response = await this.api.get<Structure>(`/structure/code/${code}`);
    return response.data;
  }

  async create(data: CreateStructureDto): Promise<Structure> {
    const response = await this.api.post<Structure>('/structure', data);
    return response.data;
  }

  async update(data: UpdateStructureDto): Promise<Structure> {
    const response = await this.api.put<Structure>(`/structure/${data.id}`, data);
    return response.data;
  }

  async delete(id: number | string): Promise<void> {
    await this.api.delete(`/structure/${id}`);
  }
}
