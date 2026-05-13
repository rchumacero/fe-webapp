import { createApiClient } from "@kplian/infrastructure";
import { Organization, CreateOrganizationDto, UpdateOrganizationDto } from "../../domain/entities/Organization";
import { ORGANIZATION_API_ROUTES } from "../../routes/organization-routes";

export class OrganizationRepositoryImpl {
  private api = createApiClient('crm');

  async getAllByPersonId(personId: string): Promise<Organization[]> {
    const response = await this.api.get<Organization[]>(
      ORGANIZATION_API_ROUTES.ORGANIZATION_BY_PERSON_ID(personId)
    );
    return response.data || [];
  }

  async getById(id: string): Promise<Organization> {
    const response = await this.api.get<Organization>(
      ORGANIZATION_API_ROUTES.ORGANIZATION_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateOrganizationDto): Promise<Organization> {
    const response = await this.api.post<Organization>(
      ORGANIZATION_API_ROUTES.ORGANIZATION,
      data
    );
    return response.data;
  }

  async update(data: UpdateOrganizationDto): Promise<Organization> {
    const response = await this.api.put<Organization>(
      ORGANIZATION_API_ROUTES.ORGANIZATION_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      ORGANIZATION_API_ROUTES.ORGANIZATION_DELETE(id)
    );
  }
}
