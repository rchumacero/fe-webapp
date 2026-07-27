import { createApiClient } from "../../api/client";
import { ProductTask, CreateProductTaskDto, UpdateProductTaskDto, IProductTaskRepository } from "@kplian/core";

export class ProductTaskRepositoryImpl implements IProductTaskRepository {
  private api = createApiClient('production');

  async getAll(): Promise<ProductTask[]> {
    const response = await this.api.get<ProductTask[]>('/v1/product-task');
    return response.data || [];
   }

  async getById(id: string): Promise<ProductTask> {
    const response = await this.api.get<ProductTask>(`/v1/product-task/${id}`);
    return response.data;
  }

  async create(data: CreateProductTaskDto): Promise<ProductTask> {
    const response = await this.api.post<ProductTask>('/v1/product-task', data);
    return response.data;
  }

  async update(data: UpdateProductTaskDto): Promise<ProductTask> {
    const response = await this.api.put<ProductTask>(`/v1/product-task/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/product-task/${id}`);
  }
}
