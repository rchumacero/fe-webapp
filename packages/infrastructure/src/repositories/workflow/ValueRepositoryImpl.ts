import { createApiClient } from "../../api/client";
import { Value, CreateValueDto, UpdateValueDto, IValueRepository } from "@kplian/core";

export const VALUE_API_ROUTES = {
  VALUES: '/v1/values',
  VALUE_BY_ID: (id: string) => `/v1/values/${id}`,
  VALUE_UPDATE: (id: string) => `/v1/values/${id}`,
  VALUE_DELETE: (id: string) => `/v1/values/${id}`,
  VALUES_BY_TASK_ID: (taskId: string) => `/v1/tasks/${taskId}/values`,
};

export class ValueRepositoryImpl implements IValueRepository {
  private api = createApiClient('workflow');

  async getAll(): Promise<Value[]> {
    const response = await this.api.get<Value[]>(VALUE_API_ROUTES.VALUES);
    return response.data || [];
  }

  async getById(id: string): Promise<Value> {
    const response = await this.api.get<Value>(VALUE_API_ROUTES.VALUE_BY_ID(id));
    return response.data;
  }

  async getByTaskId(taskId: string): Promise<Value[]> {
    const response = await this.api.get<Value[]>(VALUE_API_ROUTES.VALUES_BY_TASK_ID(taskId));
    return response.data || [];
  }

  async create(data: CreateValueDto): Promise<Value> {
    const response = await this.api.post<Value>(VALUE_API_ROUTES.VALUES, data);
    return response.data;
  }

  async update(data: UpdateValueDto): Promise<Value> {
    const response = await this.api.put<Value>(VALUE_API_ROUTES.VALUE_UPDATE(data.id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(VALUE_API_ROUTES.VALUE_DELETE(id));
  }
}
