import { createApiClient } from "../../../api/client";
import { 
  Promo, 
  CreatePromoDto, 
  UpdatePromoDto,
  IPromoRepository 
} from "@kplian/core";

export const PROMO_API_ROUTES = {
  PROMO: '/v1/promos',
  PROMO_UPDATE: (id: string | number) => `/v1/promos/${id}`,
  PROMO_DELETE: (id: string | number) => `/v1/promos/${id}`,
  PROMO_BY_ID: (id: string | number) => `/v1/promos/${id}`,
};

export class PromoRepositoryImpl implements IPromoRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<Promo[]> {
    const response = await this.api.get<Promo[]>(
      PROMO_API_ROUTES.PROMO
    );
    return response.data || [];
  }

  async getById(id: string): Promise<Promo> {
    const response = await this.api.get<Promo>(
      PROMO_API_ROUTES.PROMO_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreatePromoDto): Promise<Promo> {
    const response = await this.api.post<Promo>(
      PROMO_API_ROUTES.PROMO,
      data
    );
    return response.data;
  }

  async update(data: UpdatePromoDto): Promise<Promo> {
    const response = await this.api.put<Promo>(
      PROMO_API_ROUTES.PROMO_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      PROMO_API_ROUTES.PROMO_DELETE(id)
    );
  }
}
