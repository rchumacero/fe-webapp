import { ExtraCharge, CreateExtraChargeDto, UpdateExtraChargeDto } from "../entities/ExtraCharge";

export interface IExtraChargeRepository {
  getAll(): Promise<ExtraCharge[]>;
  getBySaleId(saleId: string): Promise<ExtraCharge[]>;
  getById(id: string): Promise<ExtraCharge>;
  create(data: CreateExtraChargeDto): Promise<ExtraCharge>;
  update(data: UpdateExtraChargeDto): Promise<ExtraCharge>;
  delete(id: string): Promise<void>;
}
