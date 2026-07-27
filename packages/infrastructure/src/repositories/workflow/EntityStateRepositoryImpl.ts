import { createApiClient } from "../../api/client";
import { EntityState, CreateEntityStateDto, UpdateEntityStateDto, IEntityStateRepository } from "@kplian/core";

export const ENTITY_STATE_API_ROUTES = {
  ENTITY_STATES: '/v1/entity-states',
  ENTITY_STATE_BY_ID: (id: string) => `/v1/entity-states/${id}`,
  ENTITY_STATE_UPDATE: (id: string) => `/v1/entity-states/${id}`,
  ENTITY_STATE_DELETE: (id: string) => `/v1/entity-states/${id}`,
  ENTITY_STATES_BY_MAIN_ENTITY_ID: (mainEntityId: string) => `/v1/main-entities/${mainEntityId}/entity-states`,
};

export class EntityStateRepositoryImpl implements IEntityStateRepository {
  private api = createApiClient('workflow');

  async getAll(): Promise<EntityState[]> {
    const response = await this.api.get<EntityState[]>(ENTITY_STATE_API_ROUTES.ENTITY_STATES);
    return response.data || [];
  }

  async getById(id: string): Promise<EntityState> {
    const response = await this.api.get<EntityState>(ENTITY_STATE_API_ROUTES.ENTITY_STATE_BY_ID(id));
    return response.data;
  }

  async getByMainEntityId(mainEntityId: string): Promise<EntityState[]> {
    const response = await this.api.get<EntityState[]>(ENTITY_STATE_API_ROUTES.ENTITY_STATES_BY_MAIN_ENTITY_ID(mainEntityId));
    return response.data || [];
  }

  async create(data: CreateEntityStateDto): Promise<EntityState> {
    const response = await this.api.post<EntityState>(ENTITY_STATE_API_ROUTES.ENTITY_STATES, data);
    return response.data;
  }

  async update(data: UpdateEntityStateDto): Promise<EntityState> {
    const response = await this.api.put<EntityState>(ENTITY_STATE_API_ROUTES.ENTITY_STATE_UPDATE(data.id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(ENTITY_STATE_API_ROUTES.ENTITY_STATE_DELETE(id));
  }
}
