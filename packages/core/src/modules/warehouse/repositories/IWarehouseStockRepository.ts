import { WarehouseStock, CreateWarehouseStockDto, UpdateWarehouseStockDto } from "../entities/WarehouseStock";

export interface IWarehouseStockRepository {
  getAll(): Promise<WarehouseStock[]>;
  getById(id: string): Promise<WarehouseStock>;
  getByMovement(movementId: string): Promise<WarehouseStock[]>;
  getByItemCode(itemCode: string): Promise<WarehouseStock[]>;
  search(params: {
    movementId?: string;
    itemCode?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<any>;
  create(data: CreateWarehouseStockDto): Promise<WarehouseStock>;
  update(data: UpdateWarehouseStockDto): Promise<WarehouseStock>;
  delete(id: string): Promise<void>;
}
