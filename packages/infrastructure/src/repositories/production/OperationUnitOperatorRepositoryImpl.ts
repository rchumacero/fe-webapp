import { createApiClient } from "../../api/client";
import { OperationUnitOperator, CreateOperationUnitOperatorDto, UpdateOperationUnitOperatorDto, IOperationUnitOperatorRepository } from "@kplian/core";

export class OperationUnitOperatorRepositoryImpl implements IOperationUnitOperatorRepository {
  private api = createApiClient('production');

  async getAll(): Promise<OperationUnitOperator[]> {
    const response = await this.api.get<OperationUnitOperator[]>('/v1/operation-unit/operator');
    return response.data || [];
  }

  async getById(id: string): Promise<OperationUnitOperator> {
    const response = await this.api.get<OperationUnitOperator>(`/v1/operation-unit/operator/${id}`);
    return response.data;
  }

  async create(data: CreateOperationUnitOperatorDto): Promise<OperationUnitOperator> {
    const response = await this.api.post<OperationUnitOperator>('/v1/operation-unit/operator', data);
    return response.data;
  }

  async update(data: UpdateOperationUnitOperatorDto): Promise<OperationUnitOperator> {
    const response = await this.api.put<OperationUnitOperator>(`/v1/operation-unit/operator/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/operation-unit/operator/${id}`);
  }
}
