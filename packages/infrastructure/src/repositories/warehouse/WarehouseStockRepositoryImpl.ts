import { createWarehouseApiClient } from "../../api/client";
import { WarehouseStock, CreateWarehouseStockDto, UpdateWarehouseStockDto, IWarehouseStockRepository } from "@kplian/core";

export class WarehouseStockRepositoryImpl implements IWarehouseStockRepository {
  private api = createWarehouseApiClient();

  async getAll(): Promise<WarehouseStock[]> {
    const response = await this.api.get<WarehouseStock[]>('/v1/warehouse-stock');
    return response.data || [];
  }

  async getById(id: string): Promise<WarehouseStock> {
    const response = await this.api.get<WarehouseStock>(`/v1/warehouse-stock/${id}`);
    return response.data;
  }

  async getByMovement(movementId: string): Promise<WarehouseStock[]> {
    const response = await this.api.get<WarehouseStock[]>(`/v1/warehouse-stock/movement/${movementId}`);
    return response.data || [];
  }

  async getByItemCode(itemCode: string): Promise<WarehouseStock[]> {
    const response = await this.api.get<WarehouseStock[]>(`/v1/warehouse-stock/item/${itemCode}`);
    return response.data || [];
  }

  async search(params: any): Promise<any> {
    const response = await this.api.get('/v1/warehouse-stock', { params });
    return response.data;
  }

  async create(data: CreateWarehouseStockDto): Promise<WarehouseStock> {
    const response = await this.api.post<WarehouseStock>('/v1/warehouse-stock', data);
    return response.data;
  }

  async update(data: UpdateWarehouseStockDto): Promise<WarehouseStock> {
    const response = await this.api.put<WarehouseStock>(`/v1/warehouse-stock/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/warehouse-stock/${id}`);
  }
}
