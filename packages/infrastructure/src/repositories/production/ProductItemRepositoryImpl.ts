import { createApiClient } from "../../api/client";
import { ProductItem, CreateProductItemDto, UpdateProductItemDto, IProductItemRepository } from "@kplian/core";

export class ProductItemRepositoryImpl implements IProductItemRepository {
  private api = createApiClient('production');

  async getAll(): Promise<ProductItem[]> {
    const response = await this.api.get<ProductItem[]>('/v1/product-item');
    return response.data || [];
  }

  async getById(id: string): Promise<ProductItem> {
    const response = await this.api.get<ProductItem>(`/v1/product-item/${id}`);
    return response.data;
  }

  async create(data: CreateProductItemDto): Promise<ProductItem> {
    const response = await this.api.post<ProductItem>('/v1/product-item', data);
    return response.data;
  }

  async update(data: UpdateProductItemDto): Promise<ProductItem> {
    const response = await this.api.put<ProductItem>(`/v1/product-item/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/product-item/${id}`);
  }
}
