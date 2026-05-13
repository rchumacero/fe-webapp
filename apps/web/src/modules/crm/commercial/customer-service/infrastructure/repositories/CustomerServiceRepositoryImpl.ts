import { createApiClient } from "@kplian/infrastructure";
import { DEFAULT_PAGE_SIZE } from '@kplian/core';
import { CampaignRepository } from "../../domain/repositories/CampaignRepository";
import { CreateCampaignDto, Campaign, UpdateCampaignDto } from "../../domain/entities/Campaign";

const apiClient = createApiClient('crm');
const BACKEND_ROUTES = {
  CAMPAIGN: '/v1/customer-services',
};

export class CustomerServiceRepositoryImpl implements CampaignRepository {
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

  async getGeneral(params?: {
    page: number;
    pageSize: number;
    filter?: string;
  }): Promise<Campaign[]> {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE, filter = "" } = params || {};
    try {
      const response = await apiClient.get<any>(`${BACKEND_ROUTES.CAMPAIGN}/general`, {
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
      console.error(`Error in CustomerServiceRepositoryImpl.getGeneral():`, error);
      throw error;
    }
  }

  async getCustom(params?: {
    page: number;
    pageSize: number;
    filter?: string;
  }): Promise<Campaign[]> {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE, filter = "" } = params || {};
    try {
      const response = await apiClient.get<any>(`${BACKEND_ROUTES.CAMPAIGN}/custom`, {
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
      console.error(`Error in CustomerServiceRepositoryImpl.getCustom():`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<Campaign> {
    try {
      const response = await apiClient.get<Campaign>(`${BACKEND_ROUTES.CAMPAIGN}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error in CustomerServiceRepositoryImpl.getById(${id}):`, error);
      throw error;
    }
  }

  async create(campaign: CreateCampaignDto): Promise<Campaign> {
    try {
      const response = await apiClient.post<Campaign>(BACKEND_ROUTES.CAMPAIGN, campaign);
      return response.data;
    } catch (error) {
      console.error("Error in CustomerServiceRepositoryImpl.create:", error);
      throw error;
    }
  }

  async update(campaign: UpdateCampaignDto): Promise<Campaign> {
    const { id, ...data } = campaign;
    try {
      const response = await apiClient.put<Campaign>(`${BACKEND_ROUTES.CAMPAIGN}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error in CustomerServiceRepositoryImpl.update(${id}):`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${BACKEND_ROUTES.CAMPAIGN}/${id}`);
    } catch (error) {
      console.error(`Error in CustomerServiceRepositoryImpl.delete(${id}):`, error);
      throw error;
    }
  }
}
