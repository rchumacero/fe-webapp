import { Operation, CreateOperationDto, UpdateOperationDto } from "../entities/Operation";

export interface IOperationRepository {
  getAll(): Promise<Operation[]>;
  getById(id: string): Promise<Operation>;
  create(data: CreateOperationDto): Promise<Operation>;
  update(data: UpdateOperationDto): Promise<Operation>;
  delete(id: string): Promise<void>;
  getProductsByOperationId(id: string): Promise<any[]>;
  getExtraCostsByOperationId(id: string): Promise<any[]>;
  getDetailsByOperationId(id: string): Promise<any[]>;
  nextWorkflow(requestId: string): Promise<any>;
  cancelWorkflow(requestId: string): Promise<any>;
  checkWarehouse(data: any): Promise<any>;
  warehouseInbound(data: any): Promise<any>;
  warehouseOutbound(data: any): Promise<any>;
}
