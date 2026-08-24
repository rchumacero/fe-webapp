import { createApiClient } from "../../api/client";
import { Profile, IProfileRepository, mapProfileDto, ProfileDto } from "@kplian/core";

export class ProfileRepositoryImpl implements IProfileRepository {
  private api = createApiClient('access');

  async getAll(): Promise<Profile[]> {
    const response = await this.api.get<ProfileDto[]>('/v1/profiles');
    return (response.data || []).map(mapProfileDto);
  }

  async getById(id: string): Promise<Profile> {
    const response = await this.api.get<ProfileDto>(`/v1/profiles/${id}`);
    return mapProfileDto(response.data);
  }

  async create(data: { code: string; name: string; moduleCode: string; vendorCode?: string }): Promise<Profile> {
    const response = await this.api.post<ProfileDto>('/v1/profiles', data);
    return mapProfileDto(response.data);
  }

  async update(id: string, data: { code?: string; name?: string; moduleCode?: string; vendorCode?: string }): Promise<Profile> {
    const response = await this.api.put<ProfileDto>(`/v1/profiles/${id}`, data);
    return mapProfileDto(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/profiles/${id}`);
  }
}
