import { SaleDetail, CreateSaleDetailDto, UpdateSaleDetailDto } from "../entities/SaleDetail";

export interface ISaleDetailRepository {
  getAll(): Promise<SaleDetail[]>;
  getBySaleId(saleId: string): Promise<SaleDetail[]>;
  getById(id: string): Promise<SaleDetail>;
  create(data: CreateSaleDetailDto): Promise<SaleDetail>;
  update(data: UpdateSaleDetailDto): Promise<SaleDetail>;
  delete(id: string): Promise<void>;
}
