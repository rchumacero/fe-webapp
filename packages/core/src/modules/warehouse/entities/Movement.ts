import { Warehouse } from "./Warehouse";
import { MovementDetail } from "./MovementDetail";

export interface Movement {
  id: string;
  vendorCode?: string;
  code: string;
  warehouse?: Warehouse;
  warehouseId?: string;
  movementDate: string;
  type: string; // "in" or "out"
  subtype?: string; // "ajuste", "devol", etc.
  currencyCode?: string;
  description?: string;
  warehousePersonCode?: string;
  personCode?: string;
  movementDetails?: MovementDetail[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
  sufficientStock?: boolean;
}

export interface CreateMovementDto {
  vendorCode?: string;
  code: string;
  warehouseId: string;
  movementDate: string;
  type: string;
  subtype?: string;
  currencyCode?: string;
  description?: string;
  warehousePersonCode?: string;
  personCode?: string;
}

export interface UpdateMovementDto extends Partial<CreateMovementDto> {
  id: string;
}
