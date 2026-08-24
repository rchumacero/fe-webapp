import { Profile } from '../entities/Profile';

export interface IProfileRepository {
  getAll(): Promise<Profile[]>;
  getById(id: string): Promise<Profile>;
  create(data: { code: string; name: string; moduleCode: string; vendorCode?: string }): Promise<Profile>;
  update(id: string, data: { code?: string; name?: string; moduleCode?: string; vendorCode?: string }): Promise<Profile>;
  delete(id: string): Promise<void>;
}
