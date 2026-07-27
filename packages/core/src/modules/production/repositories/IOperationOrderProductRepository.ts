import { OperationOrderProduct, CreateOperationOrderProductDto, UpdateOperationOrderProductDto } from "../entities/OperationOrderProduct";

export interface IOperationOrderProductRepository {
  getAll(): Promise<OperationOrderProduct[]>;
  getById(id: string): Promise<OperationOrderProduct>;
  create(data: CreateOperationOrderProductDto): Promise<OperationOrderProduct>;
  update(data: UpdateOperationOrderProductDto): Promise<OperationOrderProduct>;
  delete(id: string): Promise<void>;
}
