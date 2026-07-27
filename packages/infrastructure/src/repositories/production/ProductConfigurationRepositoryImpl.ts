import { createApiClient } from "../../api/client";
import { ProductConfiguration, CreateProductConfigurationDto, UpdateProductConfigurationDto, IProductConfigurationRepository } from "@kplian/core";

export class ProductConfigurationRepositoryImpl implements IProductConfigurationRepository {
  private api = createApiClient('production');

  async getAll(): Promise<ProductConfiguration[]> {
    const response = await this.api.get<ProductConfiguration[]>('/v1/product-configuration');
    return response.data || [];
  }

  async getById(id: string): Promise<ProductConfiguration> {
    const response = await this.api.get<ProductConfiguration>(`/v1/product-configuration/${id}`);
    return response.data;
  }

  async getByProductId(productId: string): Promise<ProductConfiguration[]> {
    // Note: To get configurations of a product, we usually call /v1/product/${productId}/product-configuration
    const response = await this.api.get<ProductConfiguration[]>(`/v1/product/${productId}/product-configuration`);
    return response.data || [];
  }

  async create(data: CreateProductConfigurationDto): Promise<ProductConfiguration> {
    const response = await this.api.post<ProductConfiguration>('/v1/product-configuration', data);
    return response.data;
  }

  async update(data: UpdateProductConfigurationDto): Promise<ProductConfiguration> {
    const response = await this.api.put<ProductConfiguration>(`/v1/product-configuration/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/product-configuration/${id}`);
  }

  async getItemsByConfigId(id: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/v1/product-configuration/${id}/product-item`);
    return response.data || [];
  }

  async getTasksByConfigId(id: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/v1/product-configuration/${id}/product-task`);
    return response.data || [];
  }

  async getVariablesByConfigId(id: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/v1/product-configuration/${id}/product-variable`);
    return response.data || [];
  }

  async getOperatorSkillsByConfigId(id: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/v1/product-configuration/${id}/product-operator-skill`);
    return response.data || [];
  }
}
