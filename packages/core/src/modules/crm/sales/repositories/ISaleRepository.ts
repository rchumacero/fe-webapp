import { Sale, CreateSaleDto, UpdateSaleDto } from "../entities/Sale";

export interface ISaleRepository {
  getAll(params?: {
    vendorId?: string;
    customerId?: string;
    page?: number;
    size?: number;
    filter?: string;
  }): Promise<Sale[]>;
  getById(id: string): Promise<Sale>;
  create(data: CreateSaleDto): Promise<Sale>;
  update(data: UpdateSaleDto): Promise<Sale>;
  delete(id: string): Promise<void>;
}
