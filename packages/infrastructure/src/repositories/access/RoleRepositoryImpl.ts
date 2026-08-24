import { createApiClient } from "../../api/client";
import { Role, IRoleRepository, mapRoleDto, RoleDto } from "@kplian/core";

export class RoleRepositoryImpl implements IRoleRepository {
  private api = createApiClient('access');

  async getAll(): Promise<Role[]> {
    const response = await this.api.get<RoleDto[]>('/v1/roles');
    return (response.data || []).map(mapRoleDto);
  }

  async getById(id: string): Promise<Role> {
    const response = await this.api.get<RoleDto>(`/v1/roles/${id}`);
    return mapRoleDto(response.data);
  }

  async create(data: { code: string; name: string; moduleCode: string; vendorCode?: string }): Promise<Role> {
    const response = await this.api.post<RoleDto>('/v1/roles', data);
    return mapRoleDto(response.data);
  }

  async update(id: string, data: { code?: string; name?: string; moduleCode?: string; vendorCode?: string }): Promise<Role> {
    const response = await this.api.put<RoleDto>(`/v1/roles/${id}`, data);
    return mapRoleDto(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/roles/${id}`);
  }
}
