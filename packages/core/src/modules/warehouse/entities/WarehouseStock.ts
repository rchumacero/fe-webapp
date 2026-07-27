import { Movement } from "./Movement";

export interface WarehouseStock {
  id: string;
  movement?: Movement;
  movementId?: string;
  itemCode?: string;
  quantity?: number;
  balance?: number;
  available?: number;
  unitCost?: number;
  totalCost?: number;
  balanceCost?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateWarehouseStockDto {
  movementId?: string;
  itemCode?: string;
  quantity?: number;
  balance?: number;
  available?: number;
  unitCost?: number;
  totalCost?: number;
  balanceCost?: number;
}

export interface UpdateWarehouseStockDto extends Partial<CreateWarehouseStockDto> {
  id: string;
}
