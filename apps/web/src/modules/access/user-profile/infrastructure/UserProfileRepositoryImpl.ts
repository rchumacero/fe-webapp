import { createApiClient } from "@kplian/infrastructure";
import { UserProfileRepository } from "../domain/repositories/UserProfileRepository";
import { UserProfile, CreateUserProfileDto, UpdateUserProfileDto } from "../domain/entities/UserProfile";

export class UserProfileRepositoryImpl implements UserProfileRepository {
  private _api: any;

  private get api() {
    if (!this._api) {
      this._api = createApiClient('access');
    }
    return this._api;
  }

  async getAll(): Promise<UserProfile[]> {
    const response = await this.api.get<UserProfile[]>('/v1/user-profiles');
    return response.data || [];
  }

  async getById(id: string): Promise<UserProfile> {
    const response = await this.api.get<UserProfile>(`/v1/user-profiles/${id}`);
    return response.data;
  }

  async create(data: CreateUserProfileDto): Promise<UserProfile> {
    const response = await this.api.post<UserProfile>('/v1/user-profiles', data);
    return response.data;
  }

  async update(id: string, data: UpdateUserProfileDto): Promise<UserProfile> {
    const response = await this.api.put<UserProfile>(`/v1/user-profiles/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/user-profiles/${id}`);
  }
}
