import { createApiClient } from "../../api/client";
import { OperationOrderProduct, CreateOperationOrderProductDto, UpdateOperationOrderProductDto, IOperationOrderProductRepository } from "@kplian/core";

export class OperationOrderProductRepositoryImpl implements IOperationOrderProductRepository {
  private api = createApiClient('production');

  async getAll(): Promise<OperationOrderProduct[]> {
    const response = await this.api.get<OperationOrderProduct[]>('/v1/operation-order/product');
    return response.data || [];
  }

  async getById(id: string): Promise<OperationOrderProduct> {
    const response = await this.api.get<OperationOrderProduct>(`/v1/operation-order/product/${id}`);
    return response.data;
  }

  async create(data: CreateOperationOrderProductDto): Promise<OperationOrderProduct> {
    const response = await this.api.post<OperationOrderProduct>('/v1/operation-order/product', data);
    return response.data;
  }

  async update(data: UpdateOperationOrderProductDto): Promise<OperationOrderProduct> {
    const response = await this.api.put<OperationOrderProduct>(`/v1/operation-order/product/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/operation-order/product/${id}`);
  }
}
