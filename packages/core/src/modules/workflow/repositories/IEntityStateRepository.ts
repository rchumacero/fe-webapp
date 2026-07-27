import { EntityState, CreateEntityStateDto, UpdateEntityStateDto } from "../entities/EntityState";

export interface IEntityStateRepository {
  getAll(): Promise<EntityState[]>;
  getById(id: string): Promise<EntityState>;
  getByMainEntityId(mainEntityId: string): Promise<EntityState[]>;
  create(data: CreateEntityStateDto): Promise<EntityState>;
  update(data: UpdateEntityStateDto): Promise<EntityState>;
  delete(id: string): Promise<void>;
}
