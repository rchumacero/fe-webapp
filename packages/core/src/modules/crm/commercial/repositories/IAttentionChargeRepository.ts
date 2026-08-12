import { 
  AttentionCharge, 
  CreateAttentionChargeDto, 
  UpdateAttentionChargeDto 
} from "../entities/AttentionCharge";

export interface IAttentionChargeRepository {
  getAll(): Promise<AttentionCharge[]>;
  getById(id: string): Promise<AttentionCharge>;
  create(data: CreateAttentionChargeDto): Promise<AttentionCharge>;
  update(data: UpdateAttentionChargeDto): Promise<AttentionCharge>;
  delete(id: string): Promise<void>;
}
