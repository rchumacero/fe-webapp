import { createApiClient } from "../../api/client";
import { App, IAppRepository, mapAppDto, AppDto } from "@kplian/core";

export class AppRepositoryImpl implements IAppRepository {
  private api = createApiClient('access');

  async getAll(): Promise<App[]> {
    const response = await this.api.get<AppDto[]>('/v1/apps');
    return (response.data || []).map(mapAppDto);
  }

  async getById(id: string): Promise<App> {
    const response = await this.api.get<AppDto>(`/v1/apps/${id}`);
    return mapAppDto(response.data);
  }

  async create(data: { code: string; name: string; description?: string }): Promise<App> {
    const response = await this.api.post<AppDto>('/v1/apps', data);
    return mapAppDto(response.data);
  }

  async update(id: string, data: { code?: string; name?: string; description?: string }): Promise<App> {
    const response = await this.api.put<AppDto>(`/v1/apps/${id}`, data);
    return mapAppDto(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/apps/${id}`);
  }
}
