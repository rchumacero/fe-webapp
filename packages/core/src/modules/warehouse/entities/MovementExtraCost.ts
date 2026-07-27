import { Movement } from "./Movement";
import { MovementDetail } from "./MovementDetail";

export interface MovementExtraCost {
  id: string;
  movement?: Movement;
  movementId?: string;
  movementDetail?: MovementDetail;
  movementDetailId?: string;
  extraCostCode: string;
  costAmount?: number;
  measureUnitCode?: string;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateMovementExtraCostDto {
  movementId?: string;
  movementDetailId?: string;
  extraCostCode: string;
  costAmount?: number;
  measureUnitCode?: string;
  notes?: string;
}

export interface UpdateMovementExtraCostDto extends Partial<CreateMovementExtraCostDto> {
  id: string;
}
