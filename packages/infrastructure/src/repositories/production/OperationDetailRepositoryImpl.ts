import { createApiClient } from "../../api/client";
import { OperationDetail, CreateOperationDetailDto, UpdateOperationDetailDto, IOperationDetailRepository } from "@kplian/core";

export class OperationDetailRepositoryImpl implements IOperationDetailRepository {
  private api = createApiClient('production');

  async getAll(): Promise<OperationDetail[]> {
    const response = await this.api.get<OperationDetail[]>('/v1/operation/detail');
    return response.data || [];
  }

  async getById(id: string): Promise<OperationDetail> {
    const response = await this.api.get<OperationDetail>(`/v1/operation/detail/${id}`);
    return response.data;
  }

  async create(data: CreateOperationDetailDto): Promise<OperationDetail> {
    const response = await this.api.post<OperationDetail>('/v1/operation/detail', data);
    return response.data;
  }

  async update(data: UpdateOperationDetailDto): Promise<OperationDetail> {
    const response = await this.api.put<OperationDetail>(`/v1/operation/detail/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/operation/detail/${id}`);
  }
}
