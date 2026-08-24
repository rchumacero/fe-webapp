import { createApiClient } from "../../api/client";
import { Menu, IMenuRepository, mapMenuDto, MenuDto } from "@kplian/core";

export class MenuRepositoryImpl implements IMenuRepository {
  private api = createApiClient('access');

  async getAll(): Promise<Menu[]> {
    const response = await this.api.get<MenuDto[]>('/v1/menus');
    return (response.data || []).map(mapMenuDto);
  }

  async getById(id: string): Promise<Menu> {
    const response = await this.api.get<MenuDto>(`/v1/menus/${id}`);
    return mapMenuDto(response.data);
  }

  async getByAppId(appId: string): Promise<Menu[]> {
    const response = await this.api.get<MenuDto[]>(`/v1/menus/by-app/${appId}`);
    return (response.data || []).map(mapMenuDto);
  }

  async create(data: { appId: string; code: string; name: string; description?: string }): Promise<Menu> {
    const response = await this.api.post<MenuDto>('/v1/menus', data);
    return mapMenuDto(response.data);
  }

  async update(id: string, data: { appId?: string; code?: string; name?: string; description?: string }): Promise<Menu> {
    const response = await this.api.put<MenuDto>(`/v1/menus/${id}`, data);
    return mapMenuDto(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/menus/${id}`);
  }
}
