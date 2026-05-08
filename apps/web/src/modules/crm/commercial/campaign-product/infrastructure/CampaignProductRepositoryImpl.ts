import { createApiClient } from "@kplian/infrastructure";
import { CampaignProduct, CreateCampaignProductDto, UpdateCampaignProductDto } from "../domain/CampaignProduct";
import { CAMPAIGN_PRODUCT_API_ROUTES } from "../routes/campaign-product-routes";

export class ProductRepositoryImpl {
  private api = createApiClient('crm');

  async getAll(personId: string): Promise<CampaignProduct[]> {
    const response = await this.api.get<CampaignProduct[]>(
      CAMPAIGN_PRODUCT_API_ROUTES.CAMPAIGN_PRODUCT_BY_PERSON_ID(personId)
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
