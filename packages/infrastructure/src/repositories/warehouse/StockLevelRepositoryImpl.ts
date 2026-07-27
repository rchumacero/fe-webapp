import { createWarehouseApiClient } from "../../api/client";
import { StockLevel, CreateStockLevelDto, UpdateStockLevelDto, IStockLevelRepository } from "@kplian/core";

function mapToDomain(raw: any): StockLevel {
  if (!raw) return raw;
  return {
    id: raw.id,
    warehouseId: raw.warehouse_id || raw.warehouseId,
    itemCode: raw.item_code || raw.itemCode,
    minQuantity: raw.min_quantity !== undefined ? raw.min_quantity : raw.minQuantity,
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
    warehouse_id: data.warehouseId,
    item_code: data.itemCode,
    min_quantity: data.minQuantity,
    status: data.status,
  };
}

export class StockLevelRepositoryImpl implements IStockLevelRepository {
  private api = createWarehouseApiClient();

  async getAll(): Promise<StockLevel[]> {
    const response = await this.api.get<any[]>('/v1/stock-level');
    const data = response.data || [];
    return data.map(mapToDomain);
  }

  async getById(id: string): Promise<StockLevel> {
    const response = await this.api.get<any>(`/v1/stock-level/${id}`);
    return mapToDomain(response.data);
  }

  async getByWarehouse(warehouseId: string): Promise<StockLevel[]> {
    const response = await this.api.get<any[]>(`/v1/warehouse/${warehouseId}/stock-level`);
    return (response.data || []).map(mapToDomain);
  }

  async getByItemCode(itemCode: string): Promise<StockLevel[]> {
    const response = await this.api.get<any[]>(`/v1/stock-level/item/${itemCode}`);
    return (response.data || []).map(mapToDomain);
  }

  async create(data: CreateStockLevelDto): Promise<StockLevel> {
    const response = await this.api.post<any>('/v1/stock-level', mapToDto(data));
    return mapToDomain(response.data);
  }

  async update(data: UpdateStockLevelDto): Promise<StockLevel> {
    const response = await this.api.put<any>(`/v1/stock-level/${data.id}`, mapToDto(data));
    return mapToDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/stock-level/${id}`);
  }
}
