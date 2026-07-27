import { createWarehouseApiClient } from "../../api/client";
import { Inventory, CreateInventoryDto, UpdateInventoryDto, IInventoryRepository } from "@kplian/core";

function mapDetailToDomain(raw: any): any {
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
    status: raw.status,
  };
}

function mapToDomain(raw: any): Inventory {
  if (!raw) return raw;
  return {
    id: raw.id,
    warehouseId: raw.warehouse_id || raw.warehouseId,
    vendorCode: raw.vendor_code || raw.vendorCode,
    inventoryDate: raw.inventory_date || raw.inventoryDate,
    inMovementId: raw.in_movement_id || raw.inMovementId,
    outMovementId: raw.out_movement_id || raw.outMovementId,
    inventoryDetails: Array.isArray(raw.inventory_details)
      ? raw.inventory_details.map(mapDetailToDomain)
      : Array.isArray(raw.inventoryDetails)
        ? raw.inventoryDetails.map(mapDetailToDomain)
        : undefined,
    createdAt: raw.created_at || raw.createdAt,
    createdBy: raw.created_by || raw.createdBy,
    status: raw.status,
  };
}

function mapDetailToDto(data: any): any {
  if (!data) return data;
  return {
    id: data.id,
    item_code: data.itemCode,
    inventory_quantity: data.inventoryQuantity,
    real_quantity: data.realQuantity,
    unit_cost: data.unitCost,
  };
}

function mapToDto(data: any): any {
  if (!data) return data;
  return {
    id: data.id,
    warehouse_id: data.warehouseId,
    vendor_code: data.vendorCode,
    inventory_date: data.inventoryDate,
    in_movement_id: data.inMovementId,
    out_movement_id: data.outMovementId,
    inventory_details: Array.isArray(data.inventoryDetails)
      ? data.inventoryDetails.map(mapDetailToDto)
      : undefined,
  };
}

function mapResponseToDomainList(response: any): Inventory[] {
  const rawData = response.data;
  if (!rawData) return [];
  if (Array.isArray(rawData)) {
    return rawData.map(mapToDomain);
  }
  if (rawData && Array.isArray(rawData.content)) {
    return rawData.content.map(mapToDomain);
  }
  return [];
}

export class InventoryRepositoryImpl implements IInventoryRepository {
  private api = createWarehouseApiClient();

  async getAll(): Promise<Inventory[]> {
    const response = await this.api.get<any>('/v1/inventory');
    return mapResponseToDomainList(response);
  }

  async getById(id: string): Promise<Inventory> {
    const response = await this.api.get<any>(`/v1/inventory/${id}`);
    return mapToDomain(response.data);
  }

  async getByWarehouse(warehouseId: string): Promise<Inventory[]> {
    const response = await this.api.get<any>(`/v1/inventory/warehouse/${warehouseId}`);
    return mapResponseToDomainList(response);
  }

  async getByVendor(vendorCode: string): Promise<Inventory[]> {
    const response = await this.api.get<any>('/v1/inventory', {
      params: { vendorCode }
    });
    return mapResponseToDomainList(response);
  }

  async search(params: any): Promise<any> {
    const response = await this.api.get('/v1/inventory', { params });
    const rawData = response.data;
    if (Array.isArray(rawData)) {
      return rawData.map(mapToDomain);
    }
    if (rawData && Array.isArray(rawData.content)) {
      return {
        ...rawData,
        content: rawData.content.map(mapToDomain)
      };
    }
    return rawData;
  }

  async create(data: CreateInventoryDto): Promise<Inventory> {
    const response = await this.api.post<any>('/v1/inventory', mapToDto(data));
    return mapToDomain(response.data);
  }

  async update(data: UpdateInventoryDto): Promise<Inventory> {
    const response = await this.api.put<any>(`/v1/inventory/${data.id}`, mapToDto(data));
    return mapToDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/inventory/${id}`);
  }
}
