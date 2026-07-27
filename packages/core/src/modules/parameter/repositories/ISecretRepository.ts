import { Secret, CreateSecretDto, UpdateSecretDto } from "../entities/Secret";

export interface ISecretRepository {
  getAll(): Promise<Secret[]>;
  getById(id: number): Promise<Secret>;
  getByCode(code: string): Promise<Secret>;
  create(data: CreateSecretDto): Promise<Secret>;
  update(data: UpdateSecretDto): Promise<Secret>;
  delete(id: number): Promise<void>;
}
