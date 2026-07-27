import { StockLevelAlert, CreateStockLevelAlertDto, UpdateStockLevelAlertDto } from "../entities/StockLevelAlert";

export interface IStockLevelAlertRepository {
  getAll(): Promise<StockLevelAlert[]>;
  getById(id: string): Promise<StockLevelAlert>;
  getByStockLevel(stockLevelId: string): Promise<StockLevelAlert[]>;
  create(data: CreateStockLevelAlertDto): Promise<StockLevelAlert>;
  update(data: UpdateStockLevelAlertDto): Promise<StockLevelAlert>;
  delete(id: string): Promise<void>;
}
