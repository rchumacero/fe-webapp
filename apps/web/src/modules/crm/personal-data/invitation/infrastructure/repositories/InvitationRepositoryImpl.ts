import { createApiClient } from "@kplian/infrastructure";
import { DEFAULT_PAGE_SIZE } from '@kplian/core';
import { InvitationRepository } from "../../domain/repositories/InvitationRepository";
import { Invitation, CreateInvitationDTO, UpdateInvitationDTO } from "../../domain/entities/Invitation";
import { INVITATION_API_ROUTES } from "../../routes/invitation-routes";



export class InvitationRepositoryImpl implements InvitationRepository {
  private _apiClient: any;

  private get apiClient() {
    if (!this._apiClient) {
      this._apiClient = createApiClient('crm');
    }
    return this._apiClient;
  }

  async getAllByPersonId(personId: string, params?: { 
    page: number; 
    pageSize: number; 
    filter?: string; 
  }): Promise<Invitation[]> {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE, filter = "" } = params || {};
    try {
      const response = await this.apiClient.get<any>(
        INVITATION_API_ROUTES.INVITATION_BY_PERSON_ID(personId),
        {
          params: {
            page,
            size: pageSize,
            filter,
          }
        }
      );
      const data = response.data;
      if (Array.isArray(data)) return data;
      return data.data || data.content || data.results || [];
    } catch (error) {
      console.error(`Error in InvitationRepository.getAllByPersonId(${personId}):`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<Invitation> {
    try {
      const response = await this.apiClient.get<Invitation>(
        INVITATION_API_ROUTES.INVITATION_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Error in InvitationRepository.getById(${id}):`, error);
      throw error;
    }
  }

  async create(data: CreateInvitationDTO): Promise<Invitation> {
    try {
      const response = await this.apiClient.post<Invitation>(
        INVITATION_API_ROUTES.INVITATION,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error in InvitationRepository.create:", error);
      throw error;
    }
  }

  async update(data: UpdateInvitationDTO): Promise<Invitation> {
    const { id, ...body } = data;
    try {
      const response = await this.apiClient.patch<Invitation>(
        INVITATION_API_ROUTES.INVITATION_UPDATE(id),
        body
      );
      return response.data;
    } catch (error) {
      console.error(`Error in InvitationRepository.update(${id}):`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.apiClient.delete(
        INVITATION_API_ROUTES.INVITATION_DELETE(id)
      );
    } catch (error) {
      console.error(`Error in InvitationRepository.delete(${id}):`, error);
      throw error;
    }
  }
}
