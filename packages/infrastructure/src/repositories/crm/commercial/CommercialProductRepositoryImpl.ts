import { createApiClient } from "../../../api/client";
import { 
  CommercialProduct, 
  CreateCommercialProductDto, 
  UpdateCommercialProductDto,
  ICommercialProductRepository 
} from "@kplian/core";

export const COMMERCIAL_PRODUCT_API_ROUTES = {
  COMMERCIAL_PRODUCT: '/v1/commercial-products',
  COMMERCIAL_PRODUCT_BY_CAMPAIGN: (campaignId: string | number) => `/v1/campaigns/${campaignId}/commercial-products`,
  COMMERCIAL_PRODUCT_BY_CATEGORY: (categoryCode: string) => `/v1/commercial-products/category/${categoryCode}`,
  COMMERCIAL_PRODUCT_UPDATE: (id: string | number) => `/v1/commercial-products/${id}`,
  COMMERCIAL_PRODUCT_DELETE: (id: string | number) => `/v1/commercial-products/${id}`,
  COMMERCIAL_PRODUCT_BY_ID: (id: string | number) => `/v1/commercial-products/${id}`,
};

export class CommercialProductRepositoryImpl implements ICommercialProductRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<CommercialProduct[]> {
    const response = await this.api.get<CommercialProduct[]>(
      COMMERCIAL_PRODUCT_API_ROUTES.COMMERCIAL_PRODUCT
    );
    return response.data || [];
  }

  async getByCampaignId(campaignId: string): Promise<CommercialProduct[]> {
    const response = await this.api.get<CommercialProduct[]>(
      COMMERCIAL_PRODUCT_API_ROUTES.COMMERCIAL_PRODUCT_BY_CAMPAIGN(campaignId)
    );
    return response.data || [];
  }

  async getByCategoryCode(categoryCode: string): Promise<CommercialProduct[]> {
    const response = await this.api.get<CommercialProduct[]>(
      COMMERCIAL_PRODUCT_API_ROUTES.COMMERCIAL_PRODUCT_BY_CATEGORY(categoryCode)
    );
    return response.data || [];
  }

  async getById(id: string): Promise<CommercialProduct> {
    const response = await this.api.get<CommercialProduct>(
      COMMERCIAL_PRODUCT_API_ROUTES.COMMERCIAL_PRODUCT_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateCommercialProductDto): Promise<CommercialProduct> {
    const response = await this.api.post<CommercialProduct>(
      COMMERCIAL_PRODUCT_API_ROUTES.COMMERCIAL_PRODUCT,
      data
    );
    return response.data;
  }

  async update(data: UpdateCommercialProductDto): Promise<CommercialProduct> {
    const response = await this.api.put<CommercialProduct>(
      COMMERCIAL_PRODUCT_API_ROUTES.COMMERCIAL_PRODUCT_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      COMMERCIAL_PRODUCT_API_ROUTES.COMMERCIAL_PRODUCT_DELETE(id)
    );
  }
}
