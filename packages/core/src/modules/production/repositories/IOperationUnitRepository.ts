import { OperationUnit, CreateOperationUnitDto, UpdateOperationUnitDto } from "../entities/OperationUnit";

export interface IOperationUnitRepository {
  getAll(): Promise<OperationUnit[]>;
  getById(id: string): Promise<OperationUnit>;
  create(data: CreateOperationUnitDto): Promise<OperationUnit>;
  update(data: UpdateOperationUnitDto): Promise<OperationUnit>;
  delete(id: string): Promise<void>;
  getOperatorsByUnitId(id: string): Promise<any[]>;
  getProductsByUnitId(id: string): Promise<any[]>;
  getOrganizations(): Promise<any[]>;
  getPersonsByVendorId(vendorId: string): Promise<any[]>;
}
