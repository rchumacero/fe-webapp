import { createApiClient } from "../../api/client";
import { OperationUnitProduct, CreateOperationUnitProductDto, UpdateOperationUnitProductDto, IOperationUnitProductRepository } from "@kplian/core";

export class OperationUnitProductRepositoryImpl implements IOperationUnitProductRepository {
  private api = createApiClient('production');

  async getAll(): Promise<OperationUnitProduct[]> {
    const response = await this.api.get<OperationUnitProduct[]>('/v1/operation-unit/product');
    return response.data || [];
  }

  async getById(id: string): Promise<OperationUnitProduct> {
    const response = await this.api.get<OperationUnitProduct>(`/v1/operation-unit/product/${id}`);
    return response.data;
  }

  async create(data: CreateOperationUnitProductDto): Promise<OperationUnitProduct> {
    const response = await this.api.post<OperationUnitProduct>('/v1/operation-unit/product', data);
    return response.data;
  }

  async update(data: UpdateOperationUnitProductDto): Promise<OperationUnitProduct> {
    const response = await this.api.put<OperationUnitProduct>(`/v1/operation-unit/product/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/operation-unit/product/${id}`);
  }
}
