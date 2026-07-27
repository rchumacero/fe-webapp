import { createApiClient } from "../../api/client";
import { Parameter, CreateParameterDto, UpdateParameterDto, IParameterRepository } from "@kplian/core";

export class ParameterRepositoryImpl implements IParameterRepository {
  private api = createApiClient('parameter');

  async getAll(): Promise<Parameter[]> {
    const response = await this.api.get<Parameter[]>('/parameter');
    return response.data || [];
  }

  async getById(id: number | string): Promise<Parameter> {
    const response = await this.api.get<Parameter>(`/parameter/${id}`);
    return response.data;
  }

  async getByCode(code: string): Promise<Parameter> {
    const response = await this.api.get<Parameter>(`/parameter/code/${code}`);
    return response.data;
  }

  async getByStructureId(structureId: number | string): Promise<Parameter[]> {
    const response = await this.api.get<Parameter[]>(`/parameter/structure/${structureId}`);
    return response.data || [];
  }

  async create(data: CreateParameterDto): Promise<Parameter> {
    const response = await this.api.post<Parameter>('/parameter', data);
    return response.data;
  }

  async update(data: UpdateParameterDto): Promise<Parameter> {
    const response = await this.api.put<Parameter>(`/parameter/${data.id}`, data);
    return response.data;
  }

  async delete(id: number | string): Promise<void> {
    await this.api.delete(`/parameter/${id}`);
  }
}
