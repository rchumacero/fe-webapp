import { createApiClient } from "../../../api/client";
import { 
  CommercialProductPrice, 
  CreateCommercialProductPriceDto, 
  UpdateCommercialProductPriceDto,
  ICommercialProductPriceRepository 
} from "@kplian/core";

export const COMMERCIAL_PRODUCT_PRICE_API_ROUTES = {
  COMMERCIAL_PRODUCT_PRICE: '/v1/commercial-product-prices',
  COMMERCIAL_PRODUCT_PRICE_UPDATE: (id: string | number) => `/v1/commercial-product-prices/${id}`,
  COMMERCIAL_PRODUCT_PRICE_DELETE: (id: string | number) => `/v1/commercial-product-prices/${id}`,
  COMMERCIAL_PRODUCT_PRICE_BY_ID: (id: string | number) => `/v1/commercial-product-prices/${id}`,
};

export class CommercialProductPriceRepositoryImpl implements ICommercialProductPriceRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<CommercialProductPrice[]> {
    const response = await this.api.get<CommercialProductPrice[]>(
      COMMERCIAL_PRODUCT_PRICE_API_ROUTES.COMMERCIAL_PRODUCT_PRICE
    );
    return response.data || [];
  }

  async getById(id: string): Promise<CommercialProductPrice> {
    const response = await this.api.get<CommercialProductPrice>(
      COMMERCIAL_PRODUCT_PRICE_API_ROUTES.COMMERCIAL_PRODUCT_PRICE_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateCommercialProductPriceDto): Promise<CommercialProductPrice> {
    const response = await this.api.post<CommercialProductPrice>(
      COMMERCIAL_PRODUCT_PRICE_API_ROUTES.COMMERCIAL_PRODUCT_PRICE,
      data
    );
    return response.data;
  }

  async update(data: UpdateCommercialProductPriceDto): Promise<CommercialProductPrice> {
    const response = await this.api.put<CommercialProductPrice>(
      COMMERCIAL_PRODUCT_PRICE_API_ROUTES.COMMERCIAL_PRODUCT_PRICE_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      COMMERCIAL_PRODUCT_PRICE_API_ROUTES.COMMERCIAL_PRODUCT_PRICE_DELETE(id)
    );
  }
}
