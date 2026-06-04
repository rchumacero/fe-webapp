import { createApiClient } from "../../api/client";
import { IProcessRepository, Process, CreateProcessDto, UpdateProcessDto } from "@kplian/core";

export const PROCESS_API_ROUTES = {
  PROCESS: '/v1/process',
  PROCESS_BY_ID: (id: string) => `/v1/process/${id}`,
  PROCESS_UPDATE: (id: string) => `/v1/process/${id}`,
  PROCESS_DELETE: (id: string) => `/v1/process/${id}`,
};

export class ProcessRepositoryImpl implements IProcessRepository {
  private api = createApiClient('workflow');

  async getAll(): Promise<Process[]> {
    const response = await this.api.get<Process[]>(PROCESS_API_ROUTES.PROCESS);
    return response.data || [];
  }

  async getById(id: string): Promise<Process> {
    const response = await this.api.get<Process>(PROCESS_API_ROUTES.PROCESS_BY_ID(id));
    return response.data;
  }

  async create(data: CreateProcessDto): Promise<Process> {
    const response = await this.api.post<Process>(PROCESS_API_ROUTES.PROCESS, data);
    return response.data;
  }

  async update(data: UpdateProcessDto): Promise<Process> {
    const response = await this.api.put<Process>(PROCESS_API_ROUTES.PROCESS_UPDATE(data.id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(PROCESS_API_ROUTES.PROCESS_DELETE(id));
  }
}
