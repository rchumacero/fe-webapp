import { TaskDigitalContent, CreateTaskDigitalContentDto, UpdateTaskDigitalContentDto } from "../entities/TaskDigitalContent";

export interface ITaskDigitalContentRepository {
  getAll(): Promise<TaskDigitalContent[]>;
  getById(id: string): Promise<TaskDigitalContent>;
  getByTaskId(taskId: string): Promise<TaskDigitalContent[]>;
  create(data: CreateTaskDigitalContentDto): Promise<TaskDigitalContent>;
  update(data: UpdateTaskDigitalContentDto): Promise<TaskDigitalContent>;
  delete(id: string): Promise<void>;
}
