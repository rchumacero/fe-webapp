import { Warehouse } from "./Warehouse";

export interface StockLevel {
  id: string;
  warehouse?: Warehouse;
  warehouseId?: string;
  itemCode: string;
  minQuantity?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateStockLevelDto {
  warehouseId: string;
  itemCode: string;
  minQuantity?: number;
}

export interface UpdateStockLevelDto extends Partial<CreateStockLevelDto> {
  id: string;
}
