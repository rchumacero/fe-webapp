import { createApiClient } from "../../api/client";
import { Form, CreateFormDto, UpdateFormDto, IFormRepository } from "@kplian/core";

export const FORM_API_ROUTES = {
  FORMS: '/v1/forms',
  FORM_BY_ID: (id: string) => `/v1/forms/${id}`,
  FORM_UPDATE: (id: string) => `/v1/forms/${id}`,
  FORM_DELETE: (id: string) => `/v1/forms/${id}`,
};

export class FormRepositoryImpl implements IFormRepository {
  private api = createApiClient('workflow');

  async getAll(): Promise<Form[]> {
    const response = await this.api.get<Form[]>(FORM_API_ROUTES.FORMS);
    return response.data || [];
  }

  async getById(id: string): Promise<Form> {
    const response = await this.api.get<Form>(FORM_API_ROUTES.FORM_BY_ID(id));
    return response.data;
  }

  async create(data: CreateFormDto): Promise<Form> {
    const response = await this.api.post<Form>(FORM_API_ROUTES.FORMS, data);
    return response.data;
  }

  async update(data: UpdateFormDto): Promise<Form> {
    const response = await this.api.put<Form>(FORM_API_ROUTES.FORM_UPDATE(data.id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(FORM_API_ROUTES.FORM_DELETE(id));
  }
}
