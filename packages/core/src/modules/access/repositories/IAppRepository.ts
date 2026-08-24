import { App } from '../entities/App';

export interface IAppRepository {
  getAll(): Promise<App[]>;
  getById(id: string): Promise<App>;
  create(data: { code: string; name: string; description?: string }): Promise<App>;
  update(id: string, data: { code?: string; name?: string; description?: string }): Promise<App>;
  delete(id: string): Promise<void>;
}
