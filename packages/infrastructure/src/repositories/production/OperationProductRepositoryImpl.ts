import { createApiClient } from "../../api/client";
import { OperationProduct, CreateOperationProductDto, UpdateOperationProductDto, IOperationProductRepository } from "@kplian/core";

export class OperationProductRepositoryImpl implements IOperationProductRepository {
  private api = createApiClient('production');

  async getAll(): Promise<OperationProduct[]> {
    const response = await this.api.get<OperationProduct[]>('/v1/operation/product');
    return response.data || [];
  }

  async getById(id: string): Promise<OperationProduct> {
    const response = await this.api.get<OperationProduct>(`/v1/operation/product/${id}`);
    return response.data;
  }

  async create(data: CreateOperationProductDto): Promise<OperationProduct> {
    const response = await this.api.post<OperationProduct>('/v1/operation/product', data);
    return response.data;
  }

  async update(data: UpdateOperationProductDto): Promise<OperationProduct> {
    const response = await this.api.put<OperationProduct>(`/v1/operation/product/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/operation/product/${id}`);
  }
}
