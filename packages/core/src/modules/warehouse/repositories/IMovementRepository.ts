import { Movement, CreateMovementDto, UpdateMovementDto } from "../entities/Movement";
import { MovementReportItem, MovementReportFilterDto } from "../entities/MovementReport";
export interface CheckStockItemResult {
  itemCode: string;
  description: string;
  currentQuantity: number;
  requiredQuantity: number;
  sufficient: boolean;
  message: string;
}

export interface IMovementRepository {
  getAll(statuses?: string[]): Promise<Movement[]>;
  getById(id: string): Promise<Movement>;
  getByCode(code: string): Promise<Movement>;
  getByWarehouse(warehouseId: string): Promise<Movement[]>;
  getByVendor(vendorCode: string, statuses?: string[]): Promise<Movement[]>;
  search(params: {
    warehouseId?: string;
    vendorCode?: string;
    code?: string;
    type?: string;
    subtype?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<any>;
  create(data: CreateMovementDto): Promise<Movement>;
  update(data: UpdateMovementDto): Promise<Movement>;
  delete(id: string): Promise<void>;
  checkStock(id: string): Promise<CheckStockItemResult[]>;
  requestIn(id: string): Promise<void>;
  finishIn(id: string): Promise<void>;
  requestOut(id: string): Promise<void>;
  finishOut(id: string): Promise<void>;
  getMovementsReport(filters: MovementReportFilterDto): Promise<MovementReportItem[]>;
}
