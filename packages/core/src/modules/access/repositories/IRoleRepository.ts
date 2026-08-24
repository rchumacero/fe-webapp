import { Role } from '../entities/Role';

export interface IRoleRepository {
  getAll(): Promise<Role[]>;
  getById(id: string): Promise<Role>;
  create(data: { code: string; name: string; moduleCode: string; vendorCode?: string }): Promise<Role>;
  update(id: string, data: { code?: string; name?: string; moduleCode?: string; vendorCode?: string }): Promise<Role>;
  delete(id: string): Promise<void>;
}
