import { 
  CampaignProduct, 
  CreateCampaignProductDto, 
  UpdateCampaignProductDto 
} from "../entities/CampaignProduct";

export interface ICampaignProductRepository {
  getAll(): Promise<CampaignProduct[]>;
  getByCommercialProductId(commercialProductId: string): Promise<CampaignProduct[]>;
  getById(id: string): Promise<CampaignProduct>;
  create(data: CreateCampaignProductDto): Promise<CampaignProduct>;
  update(data: UpdateCampaignProductDto): Promise<CampaignProduct>;
  delete(id: string): Promise<void>;
}
