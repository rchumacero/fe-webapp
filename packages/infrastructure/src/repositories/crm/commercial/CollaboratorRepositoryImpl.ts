import { createApiClient } from "../../../api/client";
import { 
  Collaborator, 
  CreateCollaboratorDto, 
  UpdateCollaboratorDto,
  ICollaboratorRepository 
} from "@kplian/core";

export const COLLABORATOR_API_ROUTES = {
  COLLABORATOR: '/v1/collaborators',
  COLLABORATOR_BY_COMMERCIAL_PRODUCT_ID: (id: string | number) => `/v1/commercial-products/${id}/collaborators`,
  COLLABORATOR_UPDATE: (id: string | number) => `/v1/collaborators/${id}`,
  COLLABORATOR_DELETE: (id: string | number) => `/v1/collaborators/${id}`,
  COLLABORATOR_BY_ID: (id: string | number) => `/v1/collaborators/${id}`,
};

export class CollaboratorRepositoryImpl implements ICollaboratorRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<Collaborator[]> {
    const response = await this.api.get<Collaborator[]>(
      COLLABORATOR_API_ROUTES.COLLABORATOR
    );
    return response.data || [];
  }

  async getByCommercialProductId(commercialProductId: string): Promise<Collaborator[]> {
    const response = await this.api.get<Collaborator[]>(
      COLLABORATOR_API_ROUTES.COLLABORATOR_BY_COMMERCIAL_PRODUCT_ID(commercialProductId)
    );
    return response.data || [];
  }

  async getById(id: string): Promise<Collaborator> {
    const response = await this.api.get<Collaborator>(
      COLLABORATOR_API_ROUTES.COLLABORATOR_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateCollaboratorDto): Promise<Collaborator> {
    const response = await this.api.post<Collaborator>(
      COLLABORATOR_API_ROUTES.COLLABORATOR,
      data
    );
    return response.data;
  }

  async update(data: UpdateCollaboratorDto): Promise<Collaborator> {
    const response = await this.api.put<Collaborator>(
      COLLABORATOR_API_ROUTES.COLLABORATOR_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      COLLABORATOR_API_ROUTES.COLLABORATOR_DELETE(id)
    );
  }
}
