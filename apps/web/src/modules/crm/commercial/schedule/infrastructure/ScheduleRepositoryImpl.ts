import { createApiClient } from "@kplian/infrastructure";
import { Schedule, CreateScheduleDto, UpdateScheduleDto } from "../domain/Schedule";
import { SCHEDULE_API_ROUTES } from "../routes/schedule-routes";

export class ScheduleRepositoryImpl {
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
}
