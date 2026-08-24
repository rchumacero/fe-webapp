import { createApiClient } from "@kplian/infrastructure";
import { UserRepository } from "../domain/repositories/UserRepository";

export class UserRepositoryImpl implements UserRepository {
  private _api: any;

  private get api() {
    if (!this._api) {
      this._api = createApiClient('access');
    }
    return this._api;
  }

  async getDistinctUsers(vendorCode?: string): Promise<string[]> {
    const response = await this.api.get<string[]>('/v1/user-profiles/user', {
      params: vendorCode ? { vendorCode } : {}
    });
    return response.data || [];
  }
}
