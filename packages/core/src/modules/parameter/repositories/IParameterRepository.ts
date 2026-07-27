import { Parameter, CreateParameterDto, UpdateParameterDto } from "../entities/Parameter";

export interface IParameterRepository {
  getAll(): Promise<Parameter[]>;
  getById(id: number | string): Promise<Parameter>;
  getByCode(code: string): Promise<Parameter>;
  getByStructureId(structureId: number | string): Promise<Parameter[]>;
  create(data: CreateParameterDto): Promise<Parameter>;
  update(data: UpdateParameterDto): Promise<Parameter>;
  delete(id: number | string): Promise<void>;
}
