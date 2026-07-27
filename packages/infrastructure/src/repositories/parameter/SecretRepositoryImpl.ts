import { createApiClient } from "../../api/client";
import { Secret, CreateSecretDto, UpdateSecretDto, ISecretRepository } from "@kplian/core";

export class SecretRepositoryImpl implements ISecretRepository {
  private api = createApiClient('parameter');

  async getAll(): Promise<Secret[]> {
    const response = await this.api.get<Secret[]>('/secret');
    return response.data || [];
  }

  async getById(id: number): Promise<Secret> {
    const response = await this.api.get<Secret>(`/secret/${id}`);
    return response.data;
  }

  async getByCode(code: string): Promise<Secret> {
    const response = await this.api.get<Secret>(`/secret/code/${code}`);
    return response.data;
  }

  async create(data: CreateSecretDto): Promise<Secret> {
    const response = await this.api.post<Secret>('/secret', data);
    return response.data;
  }

  async update(data: UpdateSecretDto): Promise<Secret> {
    const response = await this.api.put<Secret>(`/secret/${data.id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await this.api.delete(`/secret/${id}`);
  }
}
