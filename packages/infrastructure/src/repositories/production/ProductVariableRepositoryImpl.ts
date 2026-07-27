import { createApiClient } from "../../api/client";
import { ProductVariable, CreateProductVariableDto, UpdateProductVariableDto, IProductVariableRepository } from "@kplian/core";

export class ProductVariableRepositoryImpl implements IProductVariableRepository {
  private api = createApiClient('production');
  private rulesApi = createApiClient('business-rules');

  async getAll(): Promise<ProductVariable[]> {
    const response = await this.api.get<ProductVariable[]>('/v1/product-variable');
    return response.data || [];
  }

  async getById(id: string): Promise<ProductVariable> {
    const response = await this.api.get<ProductVariable>(`/v1/product-variable/${id}`);
    return response.data;
  }

  async create(data: CreateProductVariableDto): Promise<ProductVariable> {
    const response = await this.api.post<ProductVariable>('/v1/product-variable', data);
    return response.data;
  }

  async update(data: UpdateProductVariableDto): Promise<ProductVariable> {
    const response = await this.api.put<ProductVariable>(`/v1/product-variable/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/product-variable/${id}`);
  }

  async getRulesByVendor(vendorCode: string): Promise<any[]> {
    const response = await this.rulesApi.get<any[]>(`/rules/vendor/${vendorCode}`);
    return response.data || [];
  }
}
