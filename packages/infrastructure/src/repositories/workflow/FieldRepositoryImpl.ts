import { createApiClient } from "../../api/client";
import { Field, CreateFieldDto, UpdateFieldDto, IFieldRepository } from "@kplian/core";

export const FIELD_API_ROUTES = {
  FIELDS: '/v1/fields',
  FIELD_BY_ID: (id: string) => `/v1/fields/${id}`,
  FIELD_UPDATE: (id: string) => `/v1/fields/${id}`,
  FIELD_DELETE: (id: string) => `/v1/fields/${id}`,
  FIELDS_BY_FORM_ID: (formId: string) => `/v1/forms/${formId}/fields`,
};

export class FieldRepositoryImpl implements IFieldRepository {
  private api = createApiClient('workflow');

  async getAll(): Promise<Field[]> {
    const response = await this.api.get<Field[]>(FIELD_API_ROUTES.FIELDS);
    return response.data || [];
  }

  async getById(id: string): Promise<Field> {
    const response = await this.api.get<Field>(FIELD_API_ROUTES.FIELD_BY_ID(id));
    return response.data;
  }

  async getByFormId(formId: string): Promise<Field[]> {
    const response = await this.api.get<Field[]>(FIELD_API_ROUTES.FIELDS_BY_FORM_ID(formId));
    return response.data || [];
  }

  async create(data: CreateFieldDto): Promise<Field> {
    const response = await this.api.post<Field>(FIELD_API_ROUTES.FIELDS, data);
    return response.data;
  }

  async update(data: UpdateFieldDto): Promise<Field> {
    const response = await this.api.put<Field>(FIELD_API_ROUTES.FIELD_UPDATE(data.id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(FIELD_API_ROUTES.FIELD_DELETE(id));
  }
}
