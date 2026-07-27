import { OperationUnitOperator, CreateOperationUnitOperatorDto, UpdateOperationUnitOperatorDto } from "../entities/OperationUnitOperator";

export interface IOperationUnitOperatorRepository {
  getAll(): Promise<OperationUnitOperator[]>;
  getById(id: string): Promise<OperationUnitOperator>;
  create(data: CreateOperationUnitOperatorDto): Promise<OperationUnitOperator>;
  update(data: UpdateOperationUnitOperatorDto): Promise<OperationUnitOperator>;
  delete(id: string): Promise<void>;
}
