import { Resource } from '../entities/Resource';

export interface IResourceRepository {
  getAll(): Promise<Resource[]>;
  getById(id: string): Promise<Resource>;
  getChildren(id: string): Promise<Resource[]>;
  create(data: {
    code: string;
    name: string;
    description?: string;
    type: string;
    restricted: boolean;
    endpoint?: string;
    resourceId?: string;
    moduleCode: string;
    menuId?: string;
  }): Promise<Resource>;
  update(id: string, data: {
    code?: string;
    name?: string;
    description?: string;
    type?: string;
    restricted?: boolean;
    endpoint?: string;
    resourceId?: string;
    moduleCode?: string;
    menuId?: string;
  }): Promise<Resource>;
  delete(id: string): Promise<void>;
}
