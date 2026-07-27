import { createApiClient } from "../../../api/client";
import { Campaign, ICampaignRepository } from "@kplian/core";

export const CAMPAIGN_API_ROUTES = {
  AVAILABLE: '/v1/campaigns/available',
};

export class CampaignRepositoryImpl implements ICampaignRepository {
  private api = createApiClient('crm');

  async getAvailable(date?: string): Promise<Campaign[]> {
    const response = await this.api.get<Campaign[]>(
      CAMPAIGN_API_ROUTES.AVAILABLE,
      { params: date ? { date } : {} }
    );
    return response.data || [];
  }
}
