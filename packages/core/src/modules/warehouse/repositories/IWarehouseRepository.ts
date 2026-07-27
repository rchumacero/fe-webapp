import { Warehouse, CreateWarehouseDto, UpdateWarehouseDto } from "../entities/Warehouse";

export interface IWarehouseRepository {
  getAll(): Promise<Warehouse[]>;
  getById(id: string): Promise<Warehouse>;
  getByCode(code: string): Promise<Warehouse>;
  getByVendor(vendorCode: string): Promise<Warehouse[]>;
  search(params: {
    vendorCode?: string;
    code?: string;
    name?: string;
    type?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<any>;
  create(data: CreateWarehouseDto): Promise<Warehouse>;
  update(data: UpdateWarehouseDto): Promise<Warehouse>;
  delete(id: string): Promise<void>;
}
