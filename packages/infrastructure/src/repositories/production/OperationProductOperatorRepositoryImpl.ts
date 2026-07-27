import { createApiClient } from "../../api/client";
import { OperationProductOperator, CreateOperationProductOperatorDto, UpdateOperationProductOperatorDto, IOperationProductOperatorRepository } from "@kplian/core";

export class OperationProductOperatorRepositoryImpl implements IOperationProductOperatorRepository {
  private api = createApiClient('production');

  async getAll(): Promise<OperationProductOperator[]> {
    const response = await this.api.get<OperationProductOperator[]>('/v1/operation/product/operator');
    return response.data || [];
  }

  async getById(id: string): Promise<OperationProductOperator> {
    const response = await this.api.get<OperationProductOperator>(`/v1/operation/product/operator/${id}`);
    return response.data;
  }

  async create(data: CreateOperationProductOperatorDto): Promise<OperationProductOperator> {
    const response = await this.api.post<OperationProductOperator>('/v1/operation/product/operator', data);
    return response.data;
  }

  async update(data: UpdateOperationProductOperatorDto): Promise<OperationProductOperator> {
    const response = await this.api.put<OperationProductOperator>(`/v1/operation/product/operator/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/operation/product/operator/${id}`);
  }
}
