import { ParameterValue, CreateParameterValueDto, UpdateParameterValueDto } from "../entities/ParameterValue";

export interface IParameterValueRepository {
  getAll(): Promise<ParameterValue[]>;
  getById(id: number | string): Promise<ParameterValue>;
  getByVariableId(variableId: number | string): Promise<ParameterValue[]>;
  getTransposedBatch(fullCode: string, vendorCode?: string): Promise<any[]>;
  createTransposedRow(parameterId: string, vendorCode: string, dataset: any[], viewRoute?: string): Promise<void>;
  updateTransposedRow(parameterId: string, vendorCode: string, dataset: any[], viewRoute?: string): Promise<void>;
  deleteTransposedRow(parameterId: string, vendorCode: string, rowNum: number): Promise<void>;
  create(data: CreateParameterValueDto): Promise<ParameterValue>;
  update(data: UpdateParameterValueDto): Promise<ParameterValue>;
  delete(id: number | string): Promise<void>;
}
