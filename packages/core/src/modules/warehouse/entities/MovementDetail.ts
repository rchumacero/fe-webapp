import { Movement } from "./Movement";
import { MovementExtraCost } from "./MovementExtraCost";

export interface MovementDetail {
  id: string;
  movement?: Movement;
  movementId?: string;
  itemCode: string;
  quantity?: number;
  measureUnitCode?: string;
  costAmount?: number;
  extraCost?: number;
  totalCost?: number;
  movementExtraCosts?: MovementExtraCost[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateMovementDetailDto {
  movementId: string;
  itemCode: string;
  quantity?: number;
  measureUnitCode?: string;
  costAmount?: number;
  extraCost?: number;
  totalCost?: number;
}

export interface UpdateMovementDetailDto extends Partial<CreateMovementDetailDto> {
  id: string;
}
