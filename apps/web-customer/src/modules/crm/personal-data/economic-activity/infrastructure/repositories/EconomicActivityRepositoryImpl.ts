import { createApiClient } from "@kplian/infrastructure";
import { EconomicActivity, CreateEconomicActivityDto, UpdateEconomicActivityDto } from "../../domain/entities/EconomicActivity";
import { ECONOMIC_ACTIVITY_API_ROUTES } from "../../routes/economic-activity-routes";

export class EconomicActivityRepositoryImpl {
  private api = createApiClient('crm');

  async getAllByPersonId(personId: string): Promise<EconomicActivity[]> {
    const response = await this.api.get<EconomicActivity[]>(
      ECONOMIC_ACTIVITY_API_ROUTES.ECONOMIC_ACTIVITY_BY_PERSON_ID(personId)
    );
    return response.data || [];
  }

  async getById(id: string): Promise<EconomicActivity> {
    const response = await this.api.get<EconomicActivity>(
      ECONOMIC_ACTIVITY_API_ROUTES.ECONOMIC_ACTIVITY_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateEconomicActivityDto): Promise<EconomicActivity> {
    const response = await this.api.post<EconomicActivity>(
      ECONOMIC_ACTIVITY_API_ROUTES.ECONOMIC_ACTIVITY,
      data
    );
    return response.data;
  }

  async update(data: UpdateEconomicActivityDto): Promise<EconomicActivity> {
    const response = await this.api.put<EconomicActivity>(
      ECONOMIC_ACTIVITY_API_ROUTES.ECONOMIC_ACTIVITY_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      ECONOMIC_ACTIVITY_API_ROUTES.ECONOMIC_ACTIVITY_DELETE(id)
    );
  }
}
