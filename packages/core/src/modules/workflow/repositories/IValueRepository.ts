import { Value, CreateValueDto, UpdateValueDto } from "../entities/Value";

export interface IValueRepository {
  getAll(): Promise<Value[]>;
  getById(id: string): Promise<Value>;
  getByTaskId(taskId: string): Promise<Value[]>;
  create(data: CreateValueDto): Promise<Value>;
  update(data: UpdateValueDto): Promise<Value>;
  delete(id: string): Promise<void>;
}
