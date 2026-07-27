import { createApiClient } from "../../api/client";
import { OperationExtraCost, CreateOperationExtraCostDto, UpdateOperationExtraCostDto, IOperationExtraCostRepository } from "@kplian/core";

export class OperationExtraCostRepositoryImpl implements IOperationExtraCostRepository {
  private api = createApiClient('production');

  async getAll(): Promise<OperationExtraCost[]> {
    const response = await this.api.get<OperationExtraCost[]>('/v1/operation/extracost');
    return response.data || [];
  }

  async getById(id: string): Promise<OperationExtraCost> {
    const response = await this.api.get<OperationExtraCost>(`/v1/operation/extracost/${id}`);
    return response.data;
  }

  async create(data: CreateOperationExtraCostDto): Promise<OperationExtraCost> {
    const response = await this.api.post<OperationExtraCost>('/v1/operation/extracost', data);
    return response.data;
  }

  async update(data: UpdateOperationExtraCostDto): Promise<OperationExtraCost> {
    const response = await this.api.put<OperationExtraCost>(`/v1/operation/extracost/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/operation/extracost/${id}`);
  }
}
