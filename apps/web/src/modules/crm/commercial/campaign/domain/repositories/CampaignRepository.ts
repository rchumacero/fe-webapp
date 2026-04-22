import { Campaign, CreateCampaignDto, UpdateCampaignDto } from "../entities/Campaign";

export interface CampaignRepository {
  getAll(): Promise<Campaign[]>;
  getById(id: string): Promise<Campaign>;
  create(campaign: CreateCampaignDto): Promise<Campaign>;
  update(campaign: UpdateCampaignDto): Promise<Campaign>;
  delete(id: string): Promise<void>;
}
