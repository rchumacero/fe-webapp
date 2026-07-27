import { createApiClient } from "../../api/client";
import { ProductOperatorSkill, CreateProductOperatorSkillDto, UpdateProductOperatorSkillDto, IProductOperatorSkillRepository } from "@kplian/core";

export class ProductOperatorSkillRepositoryImpl implements IProductOperatorSkillRepository {
  private api = createApiClient('production');

  async getAll(): Promise<ProductOperatorSkill[]> {
    const response = await this.api.get<ProductOperatorSkill[]>('/v1/product-operator-skill');
    return response.data || [];
  }

  async getById(id: string): Promise<ProductOperatorSkill> {
    const response = await this.api.get<ProductOperatorSkill>(`/v1/product-operator-skill/${id}`);
    return response.data;
  }

  async create(data: CreateProductOperatorSkillDto): Promise<ProductOperatorSkill> {
    const response = await this.api.post<ProductOperatorSkill>('/v1/product-operator-skill', data);
    return response.data;
  }

  async update(data: UpdateProductOperatorSkillDto): Promise<ProductOperatorSkill> {
    const response = await this.api.put<ProductOperatorSkill>(`/v1/product-operator-skill/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/product-operator-skill/${id}`);
  }
}
