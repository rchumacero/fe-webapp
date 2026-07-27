import { createApiClient } from "../../api/client";
import { MainEntity, CreateMainEntityDto, UpdateMainEntityDto, IMainEntityRepository } from "@kplian/core";

export const MAIN_ENTITY_API_ROUTES = {
  MAIN_ENTITIES: '/v1/main-entities',
  MAIN_ENTITY_BY_ID: (id: string) => `/v1/main-entities/${id}`,
  MAIN_ENTITY_UPDATE: (id: string) => `/v1/main-entities/${id}`,
  MAIN_ENTITY_DELETE: (id: string) => `/v1/main-entities/${id}`,
};

export class MainEntityRepositoryImpl implements IMainEntityRepository {
  private api = createApiClient('workflow');

  async getAll(): Promise<MainEntity[]> {
    const response = await this.api.get<MainEntity[]>(MAIN_ENTITY_API_ROUTES.MAIN_ENTITIES);
    return response.data || [];
  }

  async getById(id: string): Promise<MainEntity> {
    const response = await this.api.get<MainEntity>(MAIN_ENTITY_API_ROUTES.MAIN_ENTITY_BY_ID(id));
    return response.data;
  }

  async create(data: CreateMainEntityDto): Promise<MainEntity> {
    const response = await this.api.post<MainEntity>(MAIN_ENTITY_API_ROUTES.MAIN_ENTITIES, data);
    return response.data;
  }

  async update(data: UpdateMainEntityDto): Promise<MainEntity> {
    const response = await this.api.put<MainEntity>(MAIN_ENTITY_API_ROUTES.MAIN_ENTITY_UPDATE(data.id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(MAIN_ENTITY_API_ROUTES.MAIN_ENTITY_DELETE(id));
  }
}
