import { OperationDetail, CreateOperationDetailDto, UpdateOperationDetailDto } from "../entities/OperationDetail";

export interface IOperationDetailRepository {
  getAll(): Promise<OperationDetail[]>;
  getById(id: string): Promise<OperationDetail>;
  create(data: CreateOperationDetailDto): Promise<OperationDetail>;
  update(data: UpdateOperationDetailDto): Promise<OperationDetail>;
  delete(id: string): Promise<void>;
}
