import { createApiClient } from "../../api/client";
import { ParameterValue, CreateParameterValueDto, UpdateParameterValueDto, IParameterValueRepository } from "@kplian/core";

export class ParameterValueRepositoryImpl implements IParameterValueRepository {
  private api = createApiClient('parameter');

  async getAll(): Promise<ParameterValue[]> {
    const response = await this.api.get<ParameterValue[]>('/value');
    return response.data || [];
  }

  async getById(id: number | string): Promise<ParameterValue> {
    const response = await this.api.get<ParameterValue>(`/value/${id}`);
    return response.data;
  }

  async getByVariableId(variableId: number | string): Promise<ParameterValue[]> {
    const response = await this.api.get<ParameterValue[]>(`/value/variable/${variableId}`);
    return response.data || [];
  }

  async getTransposedBatch(fullCode: string, vendorCode?: string): Promise<any[]> {
    const response = await this.api.post<any>('/value/transpose/filter/batch', [
      {
        fullCode,
        vendorCode: vendorCode || ""
      }
    ]);
    return response.data || [];
  }

  async createTransposedRow(parameterId: string, vendorCode: string, dataset: any[], viewRoute?: string): Promise<void> {
    const payload = {
      parameterId,
      vendorCode,
      viewRoute,
      dataset
    };
    await this.api.post('/value/transpose', payload);
  }

  async updateTransposedRow(parameterId: string, vendorCode: string, dataset: any[], viewRoute?: string): Promise<void> {
    const payload = {
      parameterId,
      vendorCode,
      viewRoute,
      dataset
    };
    await this.api.put('/value/transpose', payload);
  }

  async deleteTransposedRow(parameterId: string, vendorCode: string, rowNum: number): Promise<void> {
    const code = (vendorCode === null || vendorCode === undefined || vendorCode === '') ? 'null' : vendorCode;
    await this.api.delete(`/value/transpose/${parameterId}/${code}/${rowNum}`);
  }

  async create(data: CreateParameterValueDto): Promise<ParameterValue> {
    const response = await this.api.post<ParameterValue>('/value', data);
    return response.data;
  }

  async update(data: UpdateParameterValueDto): Promise<ParameterValue> {
    const response = await this.api.put<ParameterValue>(`/value/${data.id}`, data);
    return response.data;
  }

  async delete(id: number | string): Promise<void> {
    await this.api.delete(`/value/${id}`);
  }
}
