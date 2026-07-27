import { createWarehouseApiClient } from "../../api/client";
import { InventoryDetail, CreateInventoryDetailDto, UpdateInventoryDetailDto, IInventoryDetailRepository } from "@kplian/core";

function mapToDomain(raw: any): InventoryDetail {
  if (!raw) return raw;
  return {
    id: raw.id,
    inventoryId: raw.inventory_id || raw.inventoryId,
    itemCode: raw.item_code || raw.itemCode,
    inventoryQuantity: raw.inventory_quantity || raw.inventoryQuantity,
    realQuantity: raw.real_quantity || raw.realQuantity,
    unitCost: raw.unit_cost || raw.unitCost,
    createdAt: raw.created_at || raw.createdAt,
    createdBy: raw.created_by || raw.createdBy,
    updatedAt: raw.updated_at || raw.updatedAt,
    updatedBy: raw.updated_by || raw.updatedBy,
    deletedAt: raw.deleted_at || raw.deletedAt,
    deletedBy: raw.deleted_by || raw.deletedBy,
    status: raw.status,
  };
}

function mapToDto(data: any): any {
  if (!data) return data;
  return {
    id: data.id,
    inventory_id: data.inventoryId,
    item_code: data.itemCode,
    inventory_quantity: data.inventoryQuantity,
    real_quantity: data.realQuantity,
    unit_cost: data.unitCost,
    status: data.status,
  };
}

export class InventoryDetailRepositoryImpl implements IInventoryDetailRepository {
  private api = createWarehouseApiClient();

  async getAll(): Promise<InventoryDetail[]> {
    const response = await this.api.get<any[]>('/v1/inventory-detail');
    return (response.data || []).map(mapToDomain);
  }

  async getById(id: string): Promise<InventoryDetail> {
    const response = await this.api.get<any>(`/v1/inventory-detail/${id}`);
    return mapToDomain(response.data);
  }

  async getByInventory(inventoryId: string): Promise<InventoryDetail[]> {
    const response = await this.api.get<any[]>(`/v1/inventory/${inventoryId}/inventory-detail`);
    return (response.data || []).map(mapToDomain);
  }

  async getByItemCode(itemCode: string): Promise<InventoryDetail[]> {
    const response = await this.api.get<any[]>(`/v1/inventory-detail/item/${itemCode}`);
    return (response.data || []).map(mapToDomain);
  }

  async create(data: CreateInventoryDetailDto): Promise<InventoryDetail> {
    const response = await this.api.post<any>('/v1/inventory-detail', mapToDto(data));
    return mapToDomain(response.data);
  }

  async update(data: UpdateInventoryDetailDto): Promise<InventoryDetail> {
    const response = await this.api.put<any>(`/v1/inventory-detail/${data.id}`, mapToDto(data));
    return mapToDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/inventory-detail/${id}`);
  }
}
