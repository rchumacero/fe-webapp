import { MovementDetail, CreateMovementDetailDto, UpdateMovementDetailDto } from "../entities/MovementDetail";

export interface IMovementDetailRepository {
  getAll(): Promise<MovementDetail[]>;
  getById(id: string): Promise<MovementDetail>;
  getByMovement(movementId: string): Promise<MovementDetail[]>;
  getByItemCode(itemCode: string): Promise<MovementDetail[]>;
  create(data: CreateMovementDetailDto): Promise<MovementDetail>;
  update(data: UpdateMovementDetailDto): Promise<MovementDetail>;
  delete(id: string): Promise<void>;
}
