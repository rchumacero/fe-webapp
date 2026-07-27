import { OperationProductOperator, CreateOperationProductOperatorDto, UpdateOperationProductOperatorDto } from "../entities/OperationProductOperator";

export interface IOperationProductOperatorRepository {
  getAll(): Promise<OperationProductOperator[]>;
  getById(id: string): Promise<OperationProductOperator>;
  create(data: CreateOperationProductOperatorDto): Promise<OperationProductOperator>;
  update(data: UpdateOperationProductOperatorDto): Promise<OperationProductOperator>;
  delete(id: string): Promise<void>;
}
