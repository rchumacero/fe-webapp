import { createApiClient } from "../../api/client";
import { Product, CreateProductDto, UpdateProductDto, IProductRepository } from "@kplian/core";

export class ProductRepositoryImpl implements IProductRepository {
  private api = createApiClient('production');

  async getAll(): Promise<Product[]> {
    const response = await this.api.get<Product[]>('/v1/product');
    return response.data || [];
  }

  async getById(id: string): Promise<Product> {
    const response = await this.api.get<Product>(`/v1/product/${id}`);
    return response.data;
  }

  async getByCode(code: string): Promise<Product> {
    const response = await this.api.get<Product>(`/v1/product/code/${code}`);
    return response.data;
  }

  async getByVendor(vendorCode: string): Promise<Product[]> {
    const response = await this.api.get<Product[]>(`/v1/product/vendor/${vendorCode}`);
    return response.data || [];
  }

  async getByType(type: string): Promise<Product[]> {
    const response = await this.api.get<Product[]>(`/v1/product/type/${type}`);
    return response.data || [];
  }

  async search(params: any): Promise<any> {
    const response = await this.api.get('/v1/product/search', { params });
    return response.data;
  }

  async create(data: CreateProductDto): Promise<Product> {
    const response = await this.api.post<Product>('/v1/product', data);
    return response.data;
  }

  async update(data: UpdateProductDto): Promise<Product> {
    const response = await this.api.put<Product>(`/v1/product/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/product/${id}`);
  }

  async getConfigurationsByProductId(id: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/v1/product/${id}/product-configuration`);
    return response.data || [];
  }
}
