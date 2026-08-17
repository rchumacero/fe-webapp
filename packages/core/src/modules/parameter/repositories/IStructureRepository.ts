import { Structure, CreateStructureDto, UpdateStructureDto } from "../entities/Structure";

export interface IStructureRepository {
  getAll(): Promise<Structure[]>;
  getById(id: number | string): Promise<Structure>;
  getByCode(code: string): Promise<Structure>;
  create(data: CreateStructureDto): Promise<Structure>;
  update(data: UpdateStructureDto): Promise<Structure>;
  delete(id: number | string): Promise<void>;
  getRootsByModuleCode(moduleCode: string): Promise<Structure[]>;
}
