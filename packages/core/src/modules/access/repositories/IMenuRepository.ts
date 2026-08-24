import { Menu } from '../entities/Menu';

export interface IMenuRepository {
  getAll(): Promise<Menu[]>;
  getById(id: string): Promise<Menu>;
  getByAppId(appId: string): Promise<Menu[]>;
  create(data: { appId: string; code: string; name: string; description?: string }): Promise<Menu>;
  update(id: string, data: { appId?: string; code?: string; name?: string; description?: string }): Promise<Menu>;
  delete(id: string): Promise<void>;
}
