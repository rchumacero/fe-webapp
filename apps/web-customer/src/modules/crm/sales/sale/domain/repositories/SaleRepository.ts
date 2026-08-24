import { Sale, CreateSaleDto, UpdateSaleDto } from "../entities/Sale";

export interface SaleRepository {
  getAll(): Promise<Sale[]>;
  getById(id: string): Promise<Sale>;
  create(sale: CreateSaleDto): Promise<Sale>;
  update(sale: UpdateSaleDto): Promise<Sale>;
  delete(id: string): Promise<void>;
}
