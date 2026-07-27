import { Inventory, CreateInventoryDto, UpdateInventoryDto } from "../entities/Inventory";

export interface IInventoryRepository {
  getAll(): Promise<Inventory[]>;
  getById(id: string): Promise<Inventory>;
  getByWarehouse(warehouseId: string): Promise<Inventory[]>;
  getByVendor(vendorCode: string): Promise<Inventory[]>;
  search(params: {
    warehouseId?: string;
    vendorCode?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<any>;
  create(data: CreateInventoryDto): Promise<Inventory>;
  update(data: UpdateInventoryDto): Promise<Inventory>;
  delete(id: string): Promise<void>;
}
