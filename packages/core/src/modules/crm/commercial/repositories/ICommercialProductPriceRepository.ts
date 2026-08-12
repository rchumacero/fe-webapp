import { 
  CommercialProductPrice, 
  CreateCommercialProductPriceDto, 
  UpdateCommercialProductPriceDto 
} from "../entities/CommercialProductPrice";

export interface ICommercialProductPriceRepository {
  getAll(): Promise<CommercialProductPrice[]>;
  getById(id: string): Promise<CommercialProductPrice>;
  create(data: CreateCommercialProductPriceDto): Promise<CommercialProductPrice>;
  update(data: UpdateCommercialProductPriceDto): Promise<CommercialProductPrice>;
  delete(id: string): Promise<void>;
}
