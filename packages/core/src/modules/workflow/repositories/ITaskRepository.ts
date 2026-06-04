import { Task, CreateTaskDto, UpdateTaskDto } from "../entities/Task";

export interface ITaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task>;
  getByCaseId(caseId: string): Promise<Task[]>;
  create(data: CreateTaskDto): Promise<Task>;
  update(data: UpdateTaskDto): Promise<Task>;
  delete(id: string): Promise<void>;
  claimTask(taskInstanceId: string, userId: string): Promise<void>;
  completeTask(taskInstanceId: string, variables?: any): Promise<void>;
  getUnclaimed(): Promise<Task[]>;
  getAssignedTo(userId: string): Promise<Task[]>;
  getInProgressCompletedBy(userId: string): Promise<Task[]>;
  getFinishedAndInvolved(userId: string): Promise<Task[]>;
}
