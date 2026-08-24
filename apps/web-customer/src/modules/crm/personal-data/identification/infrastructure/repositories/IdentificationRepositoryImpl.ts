import { createApiClient } from "@kplian/infrastructure";
import { IdentificationRepository } from "../../domain/repositories/IdentificationRepository";
import { Identification, CreateIdentificationDto, UpdateIdentificationDto } from "../../domain/entities/Identification";
import { IDENTIFICATION_API_ROUTES } from "../../routes/identification-routes";

export class IdentificationRepositoryImpl implements IdentificationRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<Identification[]> {
    const response = await this.api.get<Identification[]>(IDENTIFICATION_API_ROUTES.IDENTIFICATION);
    return response.data;
  }

  async getByPersonId(personId: string): Promise<Identification[]> {
    const response = await this.api.get<Identification[]>(IDENTIFICATION_API_ROUTES.IDENTIFICATION_BY_PERSON_ID(personId));
    return response.data;
  }

  async getById(id: string): Promise<Identification> {
    const response = await this.api.get<Identification>(IDENTIFICATION_API_ROUTES.IDENTIFICATION_BY_ID(id));
    return response.data;
  }

  async create(data: CreateIdentificationDto): Promise<Identification> {
    const response = await this.api.post<Identification>(IDENTIFICATION_API_ROUTES.IDENTIFICATION, data);
    return response.data;
  }

  async update(data: UpdateIdentificationDto): Promise<Identification> {
    const { id, ...updateData } = data;
    const response = await this.api.put<Identification>(IDENTIFICATION_API_ROUTES.IDENTIFICATION_UPDATE(id), updateData);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(IDENTIFICATION_API_ROUTES.IDENTIFICATION_DELETE(id));
  }
}
