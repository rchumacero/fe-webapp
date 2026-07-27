import { createApiClient } from "../../api/client";
import { OperationUnit, CreateOperationUnitDto, UpdateOperationUnitDto, IOperationUnitRepository } from "@kplian/core";

export class OperationUnitRepositoryImpl implements IOperationUnitRepository {
  private api = createApiClient('production');
  private crmApi = createApiClient('crm');

  async getAll(): Promise<OperationUnit[]> {
    const response = await this.api.get<OperationUnit[]>('/v1/operation-unit');
    return response.data || [];
  }

  async getById(id: string): Promise<OperationUnit> {
    const response = await this.api.get<OperationUnit>(`/v1/operation-unit/${id}`);
    return response.data;
  }

  async create(data: CreateOperationUnitDto): Promise<OperationUnit> {
    const response = await this.api.post<OperationUnit>('/v1/operation-unit', data);
    return response.data;
  }

  async update(data: UpdateOperationUnitDto): Promise<OperationUnit> {
    const response = await this.api.put<OperationUnit>(`/v1/operation-unit/${data.id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/v1/operation-unit/${id}`);
  }

  async getOperatorsByUnitId(id: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/v1/operation-unit/${id}/operator`);
    return response.data || [];
  }

  async getProductsByUnitId(id: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/v1/operation-unit/${id}/product`);
    return response.data || [];
  }

  async getOrganizations(): Promise<any[]> {
    const response = await this.crmApi.get<any[]>('/v1/organizations');
    return response.data || [];
  }

  async getPersonsByVendorId(vendorId: string): Promise<any[]> {
    const response = await this.crmApi.get<any[]>(`/v1/persons/by-vendor-id/${vendorId}`);
    return response.data || [];
  }
}
