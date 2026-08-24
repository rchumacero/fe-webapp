import { createApiClient } from "../../api/client";
import { Resource, IResourceRepository, mapResourceDto, ResourceDto } from "@kplian/core";

export class ResourceRepositoryImpl implements IResourceRepository {
  private api = createApiClient('access');

  async getAll(): Promise<Resource[]> {
    const response = await this.api.get<ResourceDto[]>('/v1/resources');
    return (response.data || []).map(mapResourceDto);
  }

  async getById(id: string): Promise<Resource> {
    const response = await this.api.get<ResourceDto>(`/v1/resources/${id}`);
    return mapResourceDto(response.data);
  }

  async getChildren(id: string): Promise<Resource[]> {
    const response = await this.api.get<ResourceDto[]>(`/v1/resources/${id}/children`);
    return (response.data || []).map(mapResourceDto);
  }

  async create(data: {
    code: string;
    name: string;
    description?: string;
    type: string;
    restricted: boolean;
    endpoint?: string;
    resourceId?: string;
    moduleCode: string;
    menuId?: string;
  }): Promise<Resource> {
    const response = await this.api.post<ResourceDto>('/v1/resources', data);
    return mapResourceDto(response.data);
  }

  async update(id: string, data: {
    code?: string;
    name?: string;
    description?: string;
    type?: string;
    restricted?: boolean;
    endpoint?: string;
    resourceId?: string;
    moduleCode?: string;
    menuId?: string;
  }): Promise<Resource> {
    const response = await this.api.put<ResourceDto>(`/v1/resources/${id}`, data);
    return mapResourceDto(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/resources/${id}`);
  }
}
