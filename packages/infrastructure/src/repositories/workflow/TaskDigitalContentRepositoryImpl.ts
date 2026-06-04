import { createApiClient } from "../../api/client";
import { TaskDigitalContent, CreateTaskDigitalContentDto, UpdateTaskDigitalContentDto, ITaskDigitalContentRepository } from "@kplian/core";

export const TASK_DIGITAL_CONTENT_API_ROUTES = {
  DIGITAL_CONTENTS: '/v1/digital-contents',
  DIGITAL_CONTENT_BY_ID: (id: string) => `/v1/digital-contents/${id}`,
  DIGITAL_CONTENT_UPDATE: (id: string) => `/v1/digital-contents/${id}`,
  DIGITAL_CONTENT_DELETE: (id: string) => `/v1/digital-contents/${id}`,
  DIGITAL_CONTENTS_BY_TASK_ID: (taskId: string) => `/v1/tasks/${taskId}/digital-contents`,
};

export class TaskDigitalContentRepositoryImpl implements ITaskDigitalContentRepository {
  private api = createApiClient('workflow');

  async getAll(): Promise<TaskDigitalContent[]> {
    const response = await this.api.get<TaskDigitalContent[]>(TASK_DIGITAL_CONTENT_API_ROUTES.DIGITAL_CONTENTS);
    return response.data || [];
  }

  async getById(id: string): Promise<TaskDigitalContent> {
    const response = await this.api.get<TaskDigitalContent>(TASK_DIGITAL_CONTENT_API_ROUTES.DIGITAL_CONTENT_BY_ID(id));
    return response.data;
  }

  async getByTaskId(taskId: string): Promise<TaskDigitalContent[]> {
    const response = await this.api.get<TaskDigitalContent[]>(TASK_DIGITAL_CONTENT_API_ROUTES.DIGITAL_CONTENTS_BY_TASK_ID(taskId));
    return response.data || [];
  }

  async create(data: CreateTaskDigitalContentDto): Promise<TaskDigitalContent> {
    const response = await this.api.post<TaskDigitalContent>(TASK_DIGITAL_CONTENT_API_ROUTES.DIGITAL_CONTENTS, data);
    return response.data;
  }

  async update(data: UpdateTaskDigitalContentDto): Promise<TaskDigitalContent> {
    const response = await this.api.put<TaskDigitalContent>(TASK_DIGITAL_CONTENT_API_ROUTES.DIGITAL_CONTENT_UPDATE(data.id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(TASK_DIGITAL_CONTENT_API_ROUTES.DIGITAL_CONTENT_DELETE(id));
  }
}
