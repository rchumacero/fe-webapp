import { Case, CreateCaseDto, UpdateCaseDto } from "../entities/Case";

export interface ICaseRepository {
  getAll(): Promise<Case[]>;
  getById(id: string): Promise<Case>;
  create(data: CreateCaseDto): Promise<Case>;
  update(data: UpdateCaseDto): Promise<Case>;
  delete(id: string): Promise<void>;
}
