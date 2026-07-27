import { MovementExtraCost, CreateMovementExtraCostDto, UpdateMovementExtraCostDto } from "../entities/MovementExtraCost";

export interface IMovementExtraCostRepository {
  getAll(): Promise<MovementExtraCost[]>;
  getById(id: string): Promise<MovementExtraCost>;
  getByMovement(movementId: string): Promise<MovementExtraCost[]>;
  getByMovementDetail(movementDetailId: string): Promise<MovementExtraCost[]>;
  create(data: CreateMovementExtraCostDto): Promise<MovementExtraCost>;
  update(data: UpdateMovementExtraCostDto): Promise<MovementExtraCost>;
  delete(id: string): Promise<void>;
}
