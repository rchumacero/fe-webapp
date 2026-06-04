import { createApiClient } from "../../api/client";
import { Forward, CreateForwardDto, UpdateForwardDto, IForwardRepository } from "@kplian/core";

export const FORWARD_API_ROUTES = {
  FORWARDS: '/v1/forwards',
  FORWARD_BY_ID: (id: string) => `/v1/forwards/${id}`,
  FORWARD_UPDATE: (id: string) => `/v1/forwards/${id}`,
  FORWARD_DELETE: (id: string) => `/v1/forwards/${id}`,
  FORWARDS_BY_TASK_ID: (taskId: string) => `/v1/tasks/${taskId}/forwards`,
};

export class ForwardRepositoryImpl implements IForwardRepository {
  private api = createApiClient('workflow');

  async getAll(): Promise<Forward[]> {
    const response = await this.api.get<Forward[]>(FORWARD_API_ROUTES.FORWARDS);
    return response.data || [];
  }

  async getById(id: string): Promise<Forward> {
    const response = await this.api.get<Forward>(FORWARD_API_ROUTES.FORWARD_BY_ID(id));
    return response.data;
  }

  async getByTaskId(taskId: string): Promise<Forward[]> {
    const response = await this.api.get<Forward[]>(FORWARD_API_ROUTES.FORWARDS_BY_TASK_ID(taskId));
    return response.data || [];
  }

  async create(data: CreateForwardDto): Promise<Forward> {
    const response = await this.api.post<Forward>(FORWARD_API_ROUTES.FORWARDS, data);
    return response.data;
  }

  async update(data: UpdateForwardDto): Promise<Forward> {
    const response = await this.api.put<Forward>(FORWARD_API_ROUTES.FORWARD_UPDATE(data.id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(FORWARD_API_ROUTES.FORWARD_DELETE(id));
  }
}
