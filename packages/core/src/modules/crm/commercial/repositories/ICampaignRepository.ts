import { Campaign } from "../entities/Campaign";

export interface ICampaignRepository {
  getAvailable(date?: string): Promise<Campaign[]>;
}
