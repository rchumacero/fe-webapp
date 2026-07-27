import { OperationOrder, CreateOperationOrderDto, UpdateOperationOrderDto } from "../entities/OperationOrder";

export interface IOperationOrderRepository {
  getAll(): Promise<OperationOrder[]>;
  getById(id: string): Promise<OperationOrder>;
  create(data: CreateOperationOrderDto): Promise<OperationOrder>;
  update(data: UpdateOperationOrderDto): Promise<OperationOrder>;
  delete(id: string): Promise<void>;
  getProductsByOrderId(id: string): Promise<any[]>;
  getDetailsByOrderId(id: string): Promise<any[]>;
  nextWorkflow(requestId: string): Promise<any>;
  cancelWorkflow(requestId: string): Promise<any>;
}
