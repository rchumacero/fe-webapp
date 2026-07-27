import { createApiClient } from "../../../api/client";
import { 
  Schedule, 
  CreateScheduleDto, 
  UpdateScheduleDto,
  IScheduleRepository 
} from "@kplian/core";

export const SCHEDULE_API_ROUTES = {
  SCHEDULE: '/v1/schedules',
  SCHEDULE_BY_COMMERCIAL_PRODUCT_ID: (id: string | number) => `/v1/commercial-products/${id}/schedules`,
  SCHEDULE_BY_COLLABORATOR_ID: (id: string | number) => `/v1/collaborators/${id}/schedules`,
  SCHEDULE_UPDATE: (id: string | number) => `/v1/schedules/${id}`,
  SCHEDULE_DELETE: (id: string | number) => `/v1/schedules/${id}`,
  SCHEDULE_BY_ID: (id: string | number) => `/v1/schedules/${id}`,
  SCHEDULE_NEXT: '/v1/schedules/next',
};

export class ScheduleRepositoryImpl implements IScheduleRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<Schedule[]> {
    const response = await this.api.get<Schedule[]>(
      SCHEDULE_API_ROUTES.SCHEDULE
    );
    return response.data || [];
  }

  async getByCommercialProductId(commercialProductId: string): Promise<Schedule[]> {
    const response = await this.api.get<Schedule[]>(
      SCHEDULE_API_ROUTES.SCHEDULE_BY_COMMERCIAL_PRODUCT_ID(commercialProductId)
    );
    return response.data || [];
  }

  async getByCollaboratorId(collaboratorId: string): Promise<Schedule[]> {
    const response = await this.api.get<Schedule[]>(
      SCHEDULE_API_ROUTES.SCHEDULE_BY_COLLABORATOR_ID(collaboratorId)
    );
    return response.data || [];
  }

  async getById(id: string): Promise<Schedule> {
    const response = await this.api.get<Schedule>(
      SCHEDULE_API_ROUTES.SCHEDULE_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateScheduleDto): Promise<Schedule> {
    const response = await this.api.post<Schedule>(
      SCHEDULE_API_ROUTES.SCHEDULE,
      data
    );
    return response.data;
  }

  async update(data: UpdateScheduleDto): Promise<Schedule> {
    const response = await this.api.put<Schedule>(
      SCHEDULE_API_ROUTES.SCHEDULE_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      SCHEDULE_API_ROUTES.SCHEDULE_DELETE(id)
    );
  }

  async transitionNext(scheduleId: string): Promise<any> {
    const response = await this.api.post<any>(
      SCHEDULE_API_ROUTES.SCHEDULE_NEXT,
      { id: scheduleId, scheduleId: scheduleId }
    );
    return response.data;
  }
}
