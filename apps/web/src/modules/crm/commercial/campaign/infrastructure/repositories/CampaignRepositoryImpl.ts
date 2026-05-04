import { createApiClient } from "@kplian/infrastructure";
import { DEFAULT_PAGE_SIZE } from '@kplian/core';
import { CampaignRepository } from "../../domain/repositories/CampaignRepository";
import { CreateCampaignDto, Campaign, UpdateCampaignDto } from "../../domain/entities/Campaign";

const apiClient = createApiClient('crm');
const BACKEND_ROUTES = {
    CAMPAIGN: '/v1/campaigns',
};

export class CampaignRepositoryImpl implements CampaignRepository {
  async getByVendorId(vendorId: string, params?: { 
    page: number; 
    pageSize: number; 
    filter?: string; 
  }): Promise<Campaign[]> {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE, filter = "" } = params || {};
    try {
      const response = await apiClient.get<any>(`${BACKEND_ROUTES.CAMPAIGN}/by-vendor-id/${vendorId}`, {
        params: {
          page,
          size: pageSize,
          filter,
          _t: Date.now(),
        }
      });
      const data = response.data;
      if (Array.isArray(data)) return data;
      return data.data || data.content || data.results || [];
    } catch (error) {
      console.error(`Error in CampaignRepository.getByVendorId(${vendorId}):`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<Campaign> {
    try {
      const response = await apiClient.get<Campaign>(`${BACKEND_ROUTES.CAMPAIGN}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error in CampaignRepository.getById(${id}):`, error);
      throw error;
    }
  }

  async create(campaign: CreateCampaignDto): Promise<Campaign> {
    try {
      const response = await apiClient.post<Campaign>(BACKEND_ROUTES.CAMPAIGN, campaign);
      return response.data;
    } catch (error) {
      console.error("Error in CampaignRepository.create:", error);
      throw error;
    }
  }

  async update(campaign: UpdateCampaignDto): Promise<Campaign> {
    const { id, ...data } = campaign;
    try {
      const response = await apiClient.put<Campaign>(`${BACKEND_ROUTES.CAMPAIGN}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error in CampaignRepository.update(${id}):`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${BACKEND_ROUTES.CAMPAIGN}/${id}`);
    } catch (error) {
      console.error(`Error in CampaignRepository.delete(${id}):`, error);
      throw error;
    }
  }
}
