import { createWarehouseApiClient } from "../../api/client";
import { MovementDetail, CreateMovementDetailDto, UpdateMovementDetailDto, IMovementDetailRepository } from "@kplian/core";

function mapToDomain(raw: any): MovementDetail {
  if (!raw) return raw;
  return {
    id: raw.id,
    movementId: raw.movement_id || raw.movementId,
    itemCode: raw.item_code || raw.itemCode,
    quantity: raw.quantity,
    measureUnitCode: raw.measure_unit_code || raw.measureUnitCode,
    costAmount: raw.cost_amount || raw.costAmount,
    extraCost: raw.extra_cost || raw.extraCost,
    totalCost: raw.total_cost || raw.totalCost,
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
    movement_id: data.movementId,
    item_code: data.itemCode,
    quantity: data.quantity,
    measure_unit_code: data.measureUnitCode,
    cost_amount: data.costAmount,
    extra_cost: data.extraCost,
    total_cost: data.totalCost,
    status: data.status,
  };
}

export class MovementDetailRepositoryImpl implements IMovementDetailRepository {
  private api = createWarehouseApiClient();

  async getAll(): Promise<MovementDetail[]> {
    const response = await this.api.get<any[]>('/v1/movement-detail');
    return (response.data || []).map(mapToDomain);
  }

  async getById(id: string): Promise<MovementDetail> {
    const response = await this.api.get<any>(`/v1/movement-detail/${id}`);
    return mapToDomain(response.data);
  }

  async getByMovement(movementId: string): Promise<MovementDetail[]> {
    const response = await this.api.get<any[]>(`/v1/movement/${movementId}/movement-detail`);
    return (response.data || []).map(mapToDomain);
  }

  async getByItemCode(itemCode: string): Promise<MovementDetail[]> {
    const response = await this.api.get<any[]>(`/v1/movement-detail/item/${itemCode}`);
    return (response.data || []).map(mapToDomain);
  }

  async create(data: CreateMovementDetailDto): Promise<MovementDetail> {
    const response = await this.api.post<any>('/v1/movement-detail', mapToDto(data));
    return mapToDomain(response.data);
  }

  async update(data: UpdateMovementDetailDto): Promise<MovementDetail> {
    const response = await this.api.put<any>(`/v1/movement-detail/${data.id}`, mapToDto(data));
    return mapToDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/movement-detail/${id}`);
  }
}
