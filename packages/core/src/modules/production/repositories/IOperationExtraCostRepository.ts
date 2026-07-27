import { OperationExtraCost, CreateOperationExtraCostDto, UpdateOperationExtraCostDto } from "../entities/OperationExtraCost";

export interface IOperationExtraCostRepository {
  getAll(): Promise<OperationExtraCost[]>;
  getById(id: string): Promise<OperationExtraCost>;
  create(data: CreateOperationExtraCostDto): Promise<OperationExtraCost>;
  update(data: UpdateOperationExtraCostDto): Promise<OperationExtraCost>;
  delete(id: string): Promise<void>;
}
