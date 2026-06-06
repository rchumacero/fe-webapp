import { Campaign } from "../entities/Campaign";

export interface ICampaignRepository {
  getAvailable(): Promise<Campaign[]>;
}
