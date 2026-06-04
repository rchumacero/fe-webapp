import { createApiClient } from "../../api/client";
import { Case, CreateCaseDto, UpdateCaseDto, ICaseRepository } from "@kplian/core";

export const CASE_API_ROUTES = {
  CASES: '/v1/cases',
  CASE_BY_ID: (id: string) => `/v1/cases/${id}`,
  CASE_UPDATE: (id: string) => `/v1/cases/${id}`,
  CASE_DELETE: (id: string) => `/v1/cases/${id}`,
};

export class CaseRepositoryImpl implements ICaseRepository {
  private api = createApiClient('workflow');

  async getAll(): Promise<Case[]> {
    const response = await this.api.get<Case[]>(CASE_API_ROUTES.CASES);
    return response.data || [];
  }

  async getById(id: string): Promise<Case> {
    const response = await this.api.get<Case>(CASE_API_ROUTES.CASE_BY_ID(id));
    return response.data;
  }

  async create(data: CreateCaseDto): Promise<Case> {
    const response = await this.api.post<Case>(CASE_API_ROUTES.CASES, data);
    return response.data;
  }

  async update(data: UpdateCaseDto): Promise<Case> {
    const response = await this.api.put<Case>(CASE_API_ROUTES.CASE_UPDATE(data.id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(CASE_API_ROUTES.CASE_DELETE(id));
  }
}
