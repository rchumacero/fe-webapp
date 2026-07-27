import { createApiClient } from "../../api/client";
import { Variable, CreateVariableDto, UpdateVariableDto, IVariableRepository } from "@kplian/core";

export class VariableRepositoryImpl implements IVariableRepository {
  private api = createApiClient('parameter');

  async getAll(): Promise<Variable[]> {
    const response = await this.api.get<Variable[]>('/variable');
    return response.data || [];
  }

  async getById(id: number | string): Promise<Variable> {
    const response = await this.api.get<Variable>(`/variable/${id}`);
    return response.data;
  }

  async getByCode(code: string): Promise<Variable> {
    const response = await this.api.get<Variable>(`/variable/code/${code}`);
    return response.data;
  }

  async getByParameterId(parameterId: number | string): Promise<Variable[]> {
    const response = await this.api.get<Variable[]>(`/variable/parameter/${parameterId}`);
    return response.data || [];
  }

  async create(data: CreateVariableDto): Promise<Variable> {
    const response = await this.api.post<Variable>('/variable', data);
    return response.data;
  }

  async update(data: UpdateVariableDto): Promise<Variable> {
    const response = await this.api.put<Variable>(`/variable/${data.id}`, data);
    return response.data;
  }

  async delete(id: number | string): Promise<void> {
    await this.api.delete(`/variable/${id}`);
  }
}
