import { createApiClient } from "../../../api/client";
import { Campaign, ICampaignRepository } from "@kplian/core";

export const CAMPAIGN_API_ROUTES = {
  AVAILABLE: '/v1/campaigns/available',
};

export class CampaignRepositoryImpl implements ICampaignRepository {
  private api = createApiClient('crm');

  async getAvailable(): Promise<Campaign[]> {
    const response = await this.api.get<Campaign[]>(
      CAMPAIGN_API_ROUTES.AVAILABLE
    );
    return response.data || [];
  }
}
