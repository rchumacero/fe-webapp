import { Inventory } from "./Inventory";

export interface InventoryDetail {
  id: string;
  inventory?: Inventory;
  inventoryId?: string;
  itemCode: string;
  inventoryQuantity?: number;
  realQuantity?: number;
  unitCost?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateInventoryDetailDto {
  inventoryId: string;
  itemCode: string;
  inventoryQuantity?: number;
  realQuantity?: number;
  unitCost?: number;
}

export interface UpdateInventoryDetailDto extends Partial<CreateInventoryDetailDto> {
  id: string;
}
