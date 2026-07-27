import { OperationProduct, CreateOperationProductDto, UpdateOperationProductDto } from "../entities/OperationProduct";

export interface IOperationProductRepository {
  getAll(): Promise<OperationProduct[]>;
  getById(id: string): Promise<OperationProduct>;
  create(data: CreateOperationProductDto): Promise<OperationProduct>;
  update(data: UpdateOperationProductDto): Promise<OperationProduct>;
  delete(id: string): Promise<void>;
}
