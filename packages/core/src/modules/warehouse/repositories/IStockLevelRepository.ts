import { StockLevel, CreateStockLevelDto, UpdateStockLevelDto } from "../entities/StockLevel";

export interface IStockLevelRepository {
  getAll(): Promise<StockLevel[]>;
  getById(id: string): Promise<StockLevel>;
  getByWarehouse(warehouseId: string): Promise<StockLevel[]>;
  getByItemCode(itemCode: string): Promise<StockLevel[]>;
  create(data: CreateStockLevelDto): Promise<StockLevel>;
  update(data: UpdateStockLevelDto): Promise<StockLevel>;
  delete(id: string): Promise<void>;
}
