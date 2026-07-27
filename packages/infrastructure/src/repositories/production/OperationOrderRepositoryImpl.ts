import { createApiClient } from "../../api/client";
import { OperationOrder, CreateOperationOrderDto, UpdateOperationOrderDto, IOperationOrderRepository } from "@kplian/core";

export class OperationOrderRepositoryImpl implements IOperationOrderRepository {
  private api = createApiClient('production');

  async getAll(): Promise<OperationOrder[]> {
    const response = await this.api.get<OperationOrder[]>('/v1/operation-order');
    return response.data || [];
  }

  async getById(id: string): Promise<OperationOrder> {
    const response = await this.api.get<OperationOrder>(`/v1/operation-order/${id}`);
    return response.data;
  }

  async create(data: CreateOperationOrderDto): Promise<OperationOrder> {
    const response = await this.api.post<OperationOrder>('/v1/operation-order', data);
    return response.data;
  }

  async update(data: UpdateOperationOrderDto): Promise<OperationOrder> {
    const response = await this.api.put<OperationOrder>(`/v1/operation-order/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/operation-order/${id}`);
  }

  async getProductsByOrderId(id: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/v1/operation-order/${id}/product`);
    return response.data || [];
  }

  async getDetailsByOrderId(id: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/v1/operation-order/${id}/operation/detail`);
    return response.data || [];
  }

  async nextWorkflow(requestId: string): Promise<any> {
    const response = await this.api.post('/v1/operation-order/workflow/next', { requestId });
    return response.data;
  }

  async cancelWorkflow(requestId: string): Promise<any> {
    const response = await this.api.post('/v1/operation-order/workflow/cancel', { requestId });
    return response.data;
  }
}
