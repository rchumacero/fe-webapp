import { createApiClient } from "@kplian/infrastructure";
import { CommercialProduct } from "../../../commercial-product/domain/CommercialProduct";

const apiClient = createApiClient('crm');

export interface CampaignCategory {
  code: string;
  description: string;
}

export class CampaignSaleRepositoryImpl {
  async getActiveCategories(vendorId: string): Promise<CampaignCategory[]> {
    try {
      const response = await apiClient.get<CampaignCategory[]>('/v1/campaigns/categories/active', {
        headers: {
          'X-Vendor-Id': vendorId
        }
      });
      return response.data || [];
    } catch (error) {
      console.error("Error fetching active campaign categories:", error);
      throw error;
    }
  }

  async getCommercialProductsByCategory(categoryCode: string, vendorId: string): Promise<CommercialProduct[]> {
    try {
      const response = await apiClient.get<CommercialProduct[]>(`/v1/commercial-products/category/${categoryCode}`, {
        headers: {
          'X-Vendor-Id': vendorId
        }
      });
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching commercial products by category (${categoryCode}):`, error);
      throw error;
    }
  }
}
