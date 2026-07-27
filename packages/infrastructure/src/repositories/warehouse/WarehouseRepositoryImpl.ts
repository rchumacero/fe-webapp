import { createWarehouseApiClient } from "../../api/client";
import { Warehouse, CreateWarehouseDto, UpdateWarehouseDto, IWarehouseRepository } from "@kplian/core";

function mapToDomain(raw: any): Warehouse {
  if (!raw) return raw;
  return {
    id: raw.id,
    vendorCode: raw.vendor_code || raw.vendorCode,
    code: raw.code,
    name: raw.name,
    type: raw.type,
    locationCode: raw.location_code || raw.locationCode,
    address: raw.address,
    costMethodCode: raw.cost_method_code || raw.costMethodCode,
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
    vendor_code: data.vendorCode,
    code: data.code,
    name: data.name,
    type: data.type,
    location_code: data.locationCode,
    address: data.address,
    cost_method_code: data.costMethodCode,
    status: data.status,
  };
}

function mapResponseToDomainList(response: any): Warehouse[] {
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

export class WarehouseRepositoryImpl implements IWarehouseRepository {
  private api = createWarehouseApiClient();

  async getAll(): Promise<Warehouse[]> {
    const response = await this.api.get<any>('/v1/warehouse');
    return mapResponseToDomainList(response);
  }

  async getById(id: string): Promise<Warehouse> {
    const response = await this.api.get<any>(`/v1/warehouse/${id}`);
    return mapToDomain(response.data);
  }

  async getByCode(code: string): Promise<Warehouse> {
    const response = await this.api.get<any>(`/v1/warehouse/code/${code}`);
    return mapToDomain(response.data);
  }

  async getByVendor(vendorCode: string): Promise<Warehouse[]> {
    const response = await this.api.get<any>('/v1/warehouse', {
      params: { vendorCode }
    });
    return mapResponseToDomainList(response);
  }

  async search(params: any): Promise<any> {
    // Keep vendorCode as is because the backend expects @QueryParam("vendorCode")
    const response = await this.api.get('/v1/warehouse', { params });
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

  async create(data: CreateWarehouseDto): Promise<Warehouse> {
    const response = await this.api.post<any>('/v1/warehouse', mapToDto(data));
    return mapToDomain(response.data);
  }

  async update(data: UpdateWarehouseDto): Promise<Warehouse> {
    const response = await this.api.put<any>(`/v1/warehouse/${data.id}`, mapToDto(data));
    return mapToDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/warehouse/${id}`);
  }
}
