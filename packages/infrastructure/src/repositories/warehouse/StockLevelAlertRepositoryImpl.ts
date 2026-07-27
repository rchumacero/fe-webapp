import { createWarehouseApiClient } from "../../api/client";
import { StockLevelAlert, CreateStockLevelAlertDto, UpdateStockLevelAlertDto, IStockLevelAlertRepository } from "@kplian/core";

function mapToDomain(raw: any): StockLevelAlert {
  if (!raw) return raw;
  return {
    id: raw.id,
    stockLevelId: raw.stock_level_id || raw.stockLevelId,
    minQuantity: raw.min_quantity !== undefined ? raw.min_quantity : raw.minQuantity,
    maxQuantity: raw.max_quantity !== undefined ? raw.max_quantity : raw.maxQuantity,
    type: raw.type,
    notificationCode: raw.notification_code || raw.notificationCode,
    status: raw.status,
    createdAt: raw.created_at || raw.createdAt,
    createdBy: raw.created_by || raw.createdBy,
    updatedAt: raw.updated_at || raw.updatedAt,
    updatedBy: raw.updated_by || raw.updatedBy,
    deletedAt: raw.deleted_at || raw.deletedAt,
    deletedBy: raw.deleted_by || raw.deletedBy,
  };
}

function mapToDto(data: any): any {
  if (!data) return data;
  return {
    id: data.id,
    stock_level_id: data.stockLevelId,
    min_quantity: data.minQuantity,
    max_quantity: data.maxQuantity,
    type: data.type,
    notification_code: data.notificationCode,
    status: data.status,
  };
}

export class StockLevelAlertRepositoryImpl implements IStockLevelAlertRepository {
  private api = createWarehouseApiClient();

  async getAll(): Promise<StockLevelAlert[]> {
    const response = await this.api.get<any[]>('/v1/stock-level-alert');
    const data = response.data || [];
    return data.map(mapToDomain);
  }

  async getById(id: string): Promise<StockLevelAlert> {
    const response = await this.api.get<any>(`/v1/stock-level-alert/${id}`);
    return mapToDomain(response.data);
  }

  async getByStockLevel(stockLevelId: string): Promise<StockLevelAlert[]> {
    const response = await this.api.get<any[]>(`/v1/stock-level/${stockLevelId}/stock-level-alert`);
    return (response.data || []).map(mapToDomain);
  }

  async create(data: CreateStockLevelAlertDto): Promise<StockLevelAlert> {
    const response = await this.api.post<any>('/v1/stock-level-alert', mapToDto(data));
    return mapToDomain(response.data);
  }

  async update(data: UpdateStockLevelAlertDto): Promise<StockLevelAlert> {
    const response = await this.api.put<any>(`/v1/stock-level-alert/${data.id}`, mapToDto(data));
    return mapToDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/stock-level-alert/${id}`);
  }
}
