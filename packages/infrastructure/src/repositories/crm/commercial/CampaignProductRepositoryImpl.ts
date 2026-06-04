import { createApiClient } from "../../../api/client";
import {
  CampaignProduct,
  CreateCampaignProductDto,
  UpdateCampaignProductDto,
  ICampaignProductRepository
} from "@kplian/core";

export const CAMPAIGN_PRODUCT_API_ROUTES = {
  CAMPAIGN_PRODUCT: '/v1/campaign-products',
  CAMPAIGN_PRODUCT_UPDATE: (id: string | number) => `/v1/campaign-products/${id}`,
  CAMPAIGN_PRODUCT_DELETE: (id: string | number) => `/v1/campaign-products/${id}`,
  CAMPAIGN_PRODUCT_BY_ID: (id: string | number) => `/v1/campaign-products/${id}`,
  CAMPAIGN_PRODUCT_BY_COMMERCIAL_PRODUCT_ID: (commercialProductId: string | number) => `/v1/commercial-products/${commercialProductId}/campaign-products/`,
};

export class CampaignProductRepositoryImpl implements ICampaignProductRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<CampaignProduct[]> {
    const response = await this.api.get<CampaignProduct[]>(
      CAMPAIGN_PRODUCT_API_ROUTES.CAMPAIGN_PRODUCT
    );
    return response.data || [];
  }

  async getByCommercialProductId(commercialProductId: string): Promise<CampaignProduct[]> {
    const response = await this.api.get<CampaignProduct[]>(
      CAMPAIGN_PRODUCT_API_ROUTES.CAMPAIGN_PRODUCT_BY_COMMERCIAL_PRODUCT_ID(commercialProductId)
    );
    return response.data || [];
  }

  async getById(id: string): Promise<CampaignProduct> {
    const response = await this.api.get<CampaignProduct>(
      CAMPAIGN_PRODUCT_API_ROUTES.CAMPAIGN_PRODUCT_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateCampaignProductDto): Promise<CampaignProduct> {
    const response = await this.api.post<CampaignProduct>(
      CAMPAIGN_PRODUCT_API_ROUTES.CAMPAIGN_PRODUCT,
      data
    );
    return response.data;
  }

  async update(data: UpdateCampaignProductDto): Promise<CampaignProduct> {
    const response = await this.api.put<CampaignProduct>(
      CAMPAIGN_PRODUCT_API_ROUTES.CAMPAIGN_PRODUCT_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      CAMPAIGN_PRODUCT_API_ROUTES.CAMPAIGN_PRODUCT_DELETE(id)
    );
  }
}
