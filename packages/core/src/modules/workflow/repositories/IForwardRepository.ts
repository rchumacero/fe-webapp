import { Forward, CreateForwardDto, UpdateForwardDto } from "../entities/Forward";

export interface IForwardRepository {
  getAll(): Promise<Forward[]>;
  getById(id: string): Promise<Forward>;
  getByTaskId(taskId: string): Promise<Forward[]>;
  create(data: CreateForwardDto): Promise<Forward>;
  update(data: UpdateForwardDto): Promise<Forward>;
  delete(id: string): Promise<void>;
}
