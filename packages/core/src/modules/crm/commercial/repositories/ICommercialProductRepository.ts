import { 
  CommercialProduct, 
  CreateCommercialProductDto, 
  UpdateCommercialProductDto 
} from "../entities/CommercialProduct";

export interface ICommercialProductRepository {
  getAll(): Promise<CommercialProduct[]>;
  getByCampaignId(campaignId: string): Promise<CommercialProduct[]>;
  getByCategoryCode(categoryCode: string, date?: string): Promise<CommercialProduct[]>;
  getById(id: string): Promise<CommercialProduct>;
  create(data: CreateCommercialProductDto): Promise<CommercialProduct>;
  update(data: UpdateCommercialProductDto): Promise<CommercialProduct>;
  delete(id: string): Promise<void>;
}
