import { OperationUnitProduct, CreateOperationUnitProductDto, UpdateOperationUnitProductDto } from "../entities/OperationUnitProduct";

export interface IOperationUnitProductRepository {
  getAll(): Promise<OperationUnitProduct[]>;
  getById(id: string): Promise<OperationUnitProduct>;
  create(data: CreateOperationUnitProductDto): Promise<OperationUnitProduct>;
  update(data: UpdateOperationUnitProductDto): Promise<OperationUnitProduct>;
  delete(id: string): Promise<void>;
}
