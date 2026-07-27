import { Warehouse } from "./Warehouse";
import { Movement } from "./Movement";
import { InventoryDetail } from "./InventoryDetail";

export interface Inventory {
  id: string;
  warehouse?: Warehouse;
  warehouseId?: string;
  vendorCode?: string;
  inventoryDate: string;
  inMovement?: Movement;
  inMovementId?: string;
  outMovement?: Movement;
  outMovementId?: string;
  inventoryDetails?: InventoryDetail[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateInventoryDto {
  warehouseId: string;
  vendorCode?: string;
  inventoryDate: string;
  inMovementId?: string;
  outMovementId?: string;
}

export interface UpdateInventoryDto extends Partial<CreateInventoryDto> {
  id: string;
}
