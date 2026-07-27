import { createApiClient } from "../../api/client";
import { Operation, CreateOperationDto, UpdateOperationDto, IOperationRepository } from "@kplian/core";

export class OperationRepositoryImpl implements IOperationRepository {
  private api = createApiClient('production');

  async getAll(): Promise<Operation[]> {
    const response = await this.api.get<Operation[]>('/v1/operation');
    return response.data || [];
  }

  async getById(id: string): Promise<Operation> {
    const response = await this.api.get<Operation>(`/v1/operation/${id}`);
    return response.data;
  }

  async create(data: CreateOperationDto): Promise<Operation> {
    const response = await this.api.post<Operation>('/v1/operation', data);
    return response.data;
  }

  async update(data: UpdateOperationDto): Promise<Operation> {
    const response = await this.api.put<Operation>(`/v1/operation/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/operation/${id}`);
  }

  async getProductsByOperationId(id: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/v1/operation/${id}/product`);
    return response.data || [];
  }

  async getExtraCostsByOperationId(id: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/v1/operation/${id}/extracost`);
    return response.data || [];
  }

  async getDetailsByOperationId(id: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/v1/operation/${id}/detail`);
    return response.data || [];
  }

  async nextWorkflow(requestId: string): Promise<any> {
    const response = await this.api.post('/v1/operation/workflow/next', { requestId });
    return response.data;
  }

  async cancelWorkflow(requestId: string): Promise<any> {
    const response = await this.api.post('/v1/operation/workflow/cancel', { requestId });
    return response.data;
  }

  async checkWarehouse(data: any): Promise<any> {
    const response = await this.api.post('/v1/operation/warehouse/check', data);
    return response.data;
  }

  async warehouseInbound(data: any): Promise<any> {
    const response = await this.api.post('/v1/operation/warehouse/inbound', data);
    return response.data;
  }

  async warehouseOutbound(data: any): Promise<any> {
    const response = await this.api.post('/v1/operation/warehouse/outbound', data);
    return response.data;
  }
}
