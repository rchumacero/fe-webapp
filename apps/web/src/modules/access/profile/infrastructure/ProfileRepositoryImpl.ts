import { createApiClient } from "@kplian/infrastructure";
import { ProfileRepository } from "../domain/repositories/ProfileRepository";
import { Profile, CreateProfileDto, UpdateProfileDto } from "../domain/entities/Profile";
import { PROFILE_API_ROUTES } from "../routes/profile-routes";

export class ProfileRepositoryImpl implements ProfileRepository {
  private _api: any;

  private get api() {
    if (!this._api) {
      this._api = createApiClient('access');
    }
    return this._api;
  }

  async getAll(): Promise<Profile[]> {
    const response = await this.api.get<Profile[]>(PROFILE_API_ROUTES.PROFILE);
    return response.data;
  }

  async getById(id: string): Promise<Profile> {
    const response = await this.api.get<Profile>(PROFILE_API_ROUTES.PROFILE_BY_ID(id));
    return response.data;
  }

  async create(data: CreateProfileDto): Promise<Profile> {
    const response = await this.api.post<Profile>(PROFILE_API_ROUTES.PROFILE, data);
    return response.data;
  }

  async update(data: UpdateProfileDto): Promise<Profile> {
    const { id, ...updateData } = data;
    const response = await this.api.put<Profile>(PROFILE_API_ROUTES.PROFILE_UPDATE(id), updateData);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(PROFILE_API_ROUTES.PROFILE_DELETE(id));
  }
}
