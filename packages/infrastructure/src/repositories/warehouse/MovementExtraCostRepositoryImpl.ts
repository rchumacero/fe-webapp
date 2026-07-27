import { createWarehouseApiClient } from "../../api/client";
import { MovementExtraCost, CreateMovementExtraCostDto, UpdateMovementExtraCostDto, IMovementExtraCostRepository } from "@kplian/core";

function mapToDomain(raw: any): MovementExtraCost {
  if (!raw) return raw;
  return {
    id: raw.id,
    movementId: raw.movement_id || raw.movementId,
    movementDetailId: raw.movement_detail_id || raw.movementDetailId,
    extraCostCode: raw.extra_cost_code || raw.extraCostCode,
    costAmount: raw.cost_amount !== undefined ? raw.cost_amount : raw.costAmount,
    notes: raw.notes,
    status: raw.status,
    createdAt: raw.created_at || raw.createdAt,
    createdBy: raw.created_by || raw.createdBy,
  };
}

function mapToDto(data: any): any {
  if (!data) return data;
  return {
    id: data.id,
    movement_id: data.movementId || data.movement_id,
    movement_detail_id: data.movementDetailId || data.movement_detail_id,
    extra_cost_code: data.extraCostCode || data.extra_cost_code,
    cost_amount: data.costAmount !== undefined ? data.costAmount : data.cost_amount,
    notes: data.notes,
  };
}

export class MovementExtraCostRepositoryImpl implements IMovementExtraCostRepository {
  private api = createWarehouseApiClient();

  async getAll(): Promise<MovementExtraCost[]> {
    const response = await this.api.get<any[]>('/v1/movement-extra-cost');
    return (response.data || []).map(mapToDomain);
  }

  async getById(id: string): Promise<MovementExtraCost> {
    const response = await this.api.get<any>(`/v1/movement-extra-cost/${id}`);
    return mapToDomain(response.data);
  }

  async getByMovement(movementId: string): Promise<MovementExtraCost[]> {
    const response = await this.api.get<any[]>(`/v1/movement-extra-cost/movement/${movementId}`);
    return (response.data || []).map(mapToDomain);
  }

  async getByMovementDetail(movementDetailId: string): Promise<MovementExtraCost[]> {
    const response = await this.api.get<any[]>(`/v1/movement-extra-cost/movement-detail/${movementDetailId}`);
    return (response.data || []).map(mapToDomain);
  }

  async create(data: CreateMovementExtraCostDto): Promise<MovementExtraCost> {
    const response = await this.api.post<any>('/v1/movement-extra-cost', mapToDto(data));
    return mapToDomain(response.data);
  }

  async update(data: UpdateMovementExtraCostDto): Promise<MovementExtraCost> {
    const response = await this.api.put<any>(`/v1/movement-extra-cost/${data.id}`, mapToDto(data));
    return mapToDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/movement-extra-cost/${id}`);
  }
}
