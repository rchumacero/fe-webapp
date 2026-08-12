import { 
  Promo, 
  CreatePromoDto, 
  UpdatePromoDto 
} from "../entities/Promo";

export interface IPromoRepository {
  getAll(): Promise<Promo[]>;
  getById(id: string): Promise<Promo>;
  create(data: CreatePromoDto): Promise<Promo>;
  update(data: UpdatePromoDto): Promise<Promo>;
  delete(id: string): Promise<void>;
}
