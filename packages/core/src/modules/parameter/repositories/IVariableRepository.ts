import { Variable, CreateVariableDto, UpdateVariableDto } from "../entities/Variable";

export interface IVariableRepository {
  getAll(): Promise<Variable[]>;
  getById(id: number | string): Promise<Variable>;
  getByCode(code: string): Promise<Variable>;
  getByParameterId(parameterId: number | string): Promise<Variable[]>;
  create(data: CreateVariableDto): Promise<Variable>;
  update(data: UpdateVariableDto): Promise<Variable>;
  delete(id: number | string): Promise<void>;
}
