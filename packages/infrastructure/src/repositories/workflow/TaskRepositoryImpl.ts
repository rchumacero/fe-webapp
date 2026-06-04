import { createApiClient } from "../../api/client";
import { Task, CreateTaskDto, UpdateTaskDto, ITaskRepository } from "@kplian/core";

export const TASK_API_ROUTES = {
  TASKS: '/v1/tasks',
  TASK_BY_ID: (id: string) => `/v1/tasks/${id}`,
  TASK_UPDATE: (id: string) => `/v1/tasks/${id}`,
  TASK_DELETE: (id: string) => `/v1/tasks/${id}`,
  TASKS_BY_CASE_ID: (caseId: string) => `/v1/cases/${caseId}/tasks`,
  TASK_CLAIM: (taskInstanceId: string) => `/v1/tasks/${taskInstanceId}/claim`,
  TASK_COMPLETE: (taskInstanceId: string) => `/v1/tasks/${taskInstanceId}/complete`,
  TASKS_UNCLAIMED: '/v1/tasks/unclaimed',
  TASKS_ASSIGNED: (userId: string) => `/v1/tasks/assigned/${userId}`,
  TASKS_IN_PROGRESS_COMPLETED_BY: (userId: string) => `/v1/tasks/in-progress/completed-by/${userId}`,
  TASKS_FINISHED_INVOLVED: (userId: string) => `/v1/tasks/finished/involved/${userId}`,
};

export class TaskRepositoryImpl implements ITaskRepository {
  private api = createApiClient('workflow');

  async getAll(): Promise<Task[]> {
    const response = await this.api.get<Task[]>(TASK_API_ROUTES.TASKS);
    return response.data || [];
  }

  async getById(id: string): Promise<Task> {
    const response = await this.api.get<Task>(TASK_API_ROUTES.TASK_BY_ID(id));
    return response.data;
  }

  async getByCaseId(caseId: string): Promise<Task[]> {
    const response = await this.api.get<Task[]>(TASK_API_ROUTES.TASKS_BY_CASE_ID(caseId));
    return response.data || [];
  }

  async create(data: CreateTaskDto): Promise<Task> {
    const response = await this.api.post<Task>(TASK_API_ROUTES.TASKS, data);
    return response.data;
  }

  async update(data: UpdateTaskDto): Promise<Task> {
    const response = await this.api.put<Task>(TASK_API_ROUTES.TASK_UPDATE(data.id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(TASK_API_ROUTES.TASK_DELETE(id));
  }

  async claimTask(taskInstanceId: string, userId: string): Promise<void> {
    await this.api.put(TASK_API_ROUTES.TASK_CLAIM(taskInstanceId), { userId });
  }

  async completeTask(taskInstanceId: string, variables?: any): Promise<void> {
    const payload = variables || {
      "variables": {
        "approved": { "value": true, "type": "Boolean" }
      }
    };
    await this.api.post(TASK_API_ROUTES.TASK_COMPLETE(taskInstanceId), payload);
  }

  async getUnclaimed(): Promise<Task[]> {
    const response = await this.api.get<Task[]>(TASK_API_ROUTES.TASKS_UNCLAIMED);
    return response.data || [];
  }

  async getAssignedTo(userId: string): Promise<Task[]> {
    const response = await this.api.get<Task[]>(TASK_API_ROUTES.TASKS_ASSIGNED(userId));
    return response.data || [];
  }

  async getInProgressCompletedBy(userId: string): Promise<Task[]> {
    const response = await this.api.get<Task[]>(TASK_API_ROUTES.TASKS_IN_PROGRESS_COMPLETED_BY(userId));
    return response.data || [];
  }

  async getFinishedAndInvolved(userId: string): Promise<Task[]> {
    const response = await this.api.get<Task[]>(TASK_API_ROUTES.TASKS_FINISHED_INVOLVED(userId));
    return response.data || [];
  }
}

