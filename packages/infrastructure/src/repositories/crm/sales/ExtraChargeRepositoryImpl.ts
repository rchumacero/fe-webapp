import { createApiClient } from "../../../api/client";
import { ExtraCharge, CreateExtraChargeDto, UpdateExtraChargeDto, IExtraChargeRepository } from "@kplian/core";

export const EXTRA_CHARGE_API_ROUTES = {
  CHARGE: '/v1/extra-charges',
  CHARGE_UPDATE: (id: string | number) => `/v1/extra-charges/${id}`,
  CHARGE_DELETE: (id: string | number) => `/v1/extra-charges/${id}`,
  CHARGE_BY_ID: (id: string | number) => `/v1/extra-charges/${id}`,
};

export class ExtraChargeRepositoryImpl implements IExtraChargeRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<ExtraCharge[]> {
    const response = await this.api.get<ExtraCharge[]>(
      EXTRA_CHARGE_API_ROUTES.CHARGE
    );
    return response.data || [];
  }

  async getBySaleId(saleId: string): Promise<ExtraCharge[]> {
    const response = await this.api.get<ExtraCharge[]>(
      EXTRA_CHARGE_API_ROUTES.CHARGE,
      { params: { filter: `saleId||$eq||${saleId}` } }
    );
    return response.data || [];
  }

  async getById(id: string): Promise<ExtraCharge> {
    const response = await this.api.get<ExtraCharge>(
      EXTRA_CHARGE_API_ROUTES.CHARGE_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateExtraChargeDto): Promise<ExtraCharge> {
    const response = await this.api.post<ExtraCharge>(
      EXTRA_CHARGE_API_ROUTES.CHARGE,
      data
    );
    return response.data;
  }

  async update(data: UpdateExtraChargeDto): Promise<ExtraCharge> {
    const response = await this.api.put<ExtraCharge>(
      EXTRA_CHARGE_API_ROUTES.CHARGE_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      EXTRA_CHARGE_API_ROUTES.CHARGE_DELETE(id)
    );
  }
}
