import { createWarehouseApiClient } from "../../api/client";
import { Movement, CreateMovementDto, UpdateMovementDto, IMovementRepository, CheckStockItemResult, MovementReportItem, MovementReportFilterDto } from "@kplian/core";

function mapDetailToDomain(raw: any): any {
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
    status: raw.status,
  };
}

function mapToDomain(raw: any): Movement {
  if (!raw) return raw;
  return {
    id: raw.id,
    vendorCode: raw.vendor_code || raw.vendorCode,
    code: raw.code,
    warehouseId: raw.warehouse_id || raw.warehouseId,
    movementDate: raw.movement_date || raw.movementDate,
    type: raw.type,
    subtype: raw.subtype,
    currencyCode: raw.currency_code || raw.currencyCode,
    description: raw.description,
    warehousePersonCode: raw.warehouse_person_code || raw.warehousePersonCode,
    personCode: raw.person_code || raw.personCode,
    movementDetails: Array.isArray(raw.movement_details)
      ? raw.movement_details.map(mapDetailToDomain)
      : Array.isArray(raw.movementDetails)
        ? raw.movementDetails.map(mapDetailToDomain)
        : undefined,
    createdAt: raw.created_at || raw.createdAt,
    createdBy: raw.created_by || raw.createdBy,
    status: raw.status,
  };
}

function mapDetailToDto(data: any): any {
  if (!data) return data;
  return {
    item_code: data.itemCode,
    quantity: data.quantity,
    measure_unit_code: data.measureUnitCode,
    cost_amount: data.costAmount,
  };
}

function mapToDto(data: any): any {
  if (!data) return data;
  return {
    id: data.id,
    code: data.code,
    vendor_code: data.vendorCode,
    warehouse_id: data.warehouseId,
    movement_date: data.movementDate,
    type: data.type,
    subtype: data.subtype,
    currency_code: data.currencyCode,
    description: data.description,
    warehouse_person_code: data.warehousePersonCode,
    person_code: data.personCode,
    movement_details: Array.isArray(data.movementDetails)
      ? data.movementDetails.map(mapDetailToDto)
      : undefined,
  };
}

function mapResponseToDomainList(response: any): Movement[] {
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

export class MovementRepositoryImpl implements IMovementRepository {
  private api = createWarehouseApiClient();

  async getAll(statuses?: string[]): Promise<Movement[]> {
    const response = await this.api.get<any>('/v1/movement', {
      params: { status: statuses }
    });
    return mapResponseToDomainList(response);
  }

  async getById(id: string): Promise<Movement> {
    const response = await this.api.get<any>(`/v1/movement/${id}`);
    return mapToDomain(response.data);
  }

  async getByCode(code: string): Promise<Movement> {
    const response = await this.api.get<any>(`/v1/movement/code/${code}`);
    return mapToDomain(response.data);
  }

  async getByWarehouse(warehouseId: string): Promise<Movement[]> {
    const response = await this.api.get<any>(`/v1/movement/warehouse/${warehouseId}`);
    return mapResponseToDomainList(response);
  }

  async getByVendor(vendorCode: string, statuses?: string[]): Promise<Movement[]> {
    const response = await this.api.get<any>('/v1/movement', {
      params: { vendorCode, status: statuses }
    });
    return mapResponseToDomainList(response);
  }

  async search(params: any): Promise<any> {
    const response = await this.api.get('/v1/movement', { params });
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

  async create(data: CreateMovementDto): Promise<Movement> {
    const response = await this.api.post<any>('/v1/movement', mapToDto(data));
    return mapToDomain(response.data);
  }

  async update(data: UpdateMovementDto): Promise<Movement> {
    const response = await this.api.put<any>(`/v1/movement/${data.id}`, mapToDto(data));
    return mapToDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/movement/${id}`);
  }

  async checkStock(id: string): Promise<CheckStockItemResult[]> {
    const response = await this.api.get<any[]>(`/v1/movement/${id}/checkStock`);
    const rawList = response.data || [];
    return rawList.map((raw: any) => ({
      itemCode: raw.item_code || raw.itemCode,
      description: raw.description,
      currentQuantity: raw.current_quantity !== undefined ? raw.current_quantity : raw.currentQuantity,
      requiredQuantity: raw.required_quantity !== undefined ? raw.required_quantity : raw.requiredQuantity,
      sufficient: !!raw.sufficient,
      message: raw.message,
    }));
  }

  async requestIn(id: string): Promise<void> {
    await this.api.post(`/v1/movement/in/${id}/request`);
  }

  async finishIn(id: string): Promise<void> {
    await this.api.post(`/v1/movement/in/${id}/finish`);
  }

  async requestOut(id: string): Promise<void> {
    await this.api.post(`/v1/movement/out/${id}/request`);
  }

  async finishOut(id: string): Promise<void> {
    await this.api.post(`/v1/movement/out/${id}/finish`);
  }

  async getMovementsReport(filters: MovementReportFilterDto): Promise<MovementReportItem[]> {
    const response = await this.api.get<any>('/v1/movement/movements', {
      params: filters
    });
    const rawList = response.data || [];
    return rawList.map((raw: any) => ({
      warehouseCode: raw.warehouse_code || raw.warehouseCode,
      warehouseName: raw.warehouse_name || raw.warehouseName,
      costMethodCode: raw.cost_method_code || raw.costMethodCode,
      itemCode: raw.item_code || raw.itemCode,
      movementDate: raw.movement_date || raw.movementDate,
      movementCode: raw.movement_code || raw.movementCode,
      inbound: typeof raw.inbound === 'number' ? raw.inbound : parseFloat(raw.inbound || 0),
      outbound: typeof raw.outbound === 'number' ? raw.outbound : parseFloat(raw.outbound || 0),
      available: typeof raw.available === 'number' ? raw.available : parseFloat(raw.available || 0),
      balance: typeof raw.balance === 'number' ? raw.balance : parseFloat(raw.balance || 0),
      unitCost: typeof raw.unit_cost === 'number' ? raw.unit_cost : (raw.unitCost !== undefined ? parseFloat(raw.unitCost) : parseFloat(raw.unit_cost || 0)),
      inboundValue: typeof raw.inbound_value === 'number' ? raw.inbound_value : (raw.inboundValue !== undefined ? parseFloat(raw.inboundValue) : parseFloat(raw.inbound_value || 0)),
      outboundValue: typeof raw.outbound_value === 'number' ? raw.outbound_value : (raw.outboundValue !== undefined ? parseFloat(raw.outboundValue) : parseFloat(raw.outbound_value || 0)),
      balanceCost: typeof raw.balance_cost === 'number' ? raw.balance_cost : (raw.balanceCost !== undefined ? parseFloat(raw.balanceCost) : parseFloat(raw.balance_cost || 0)),
    }));
  }
}
