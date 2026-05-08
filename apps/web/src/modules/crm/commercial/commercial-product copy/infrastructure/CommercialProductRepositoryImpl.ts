import { createApiClient } from "@kplian/infrastructure";
import { CommercialProduct, CreateCommercialProductDto, UpdateCommercialProductDto } from "../domain/CommercialProduct";
import { COMMERCIAL_PRODUCT_API_ROUTES } from "../routes/commercial-product-routes";

export class CommercialProductRepositoryImpl {
  private api = createApiClient('crm');

  async getAll(): Promise<CommercialProduct[]> {
    const response = await this.api.get<CommercialProduct[]>(
      COMMERCIAL_PRODUCT_API_ROUTES.COMMERCIAL_PRODUCT
    );
    return response.data || [];
  }

  async getById(id: string): Promise<CommercialProduct> {
    const response = await this.api.get<CommercialProduct>(
      COMMERCIAL_PRODUCT_API_ROUTES.COMMERCIAL_PRODUCT_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateCommercialProductDto): Promise<CommercialProduct> {
    const response = await this.api.post<CommercialProduct>(
      COMMERCIAL_PRODUCT_API_ROUTES.COMMERCIAL_PRODUCT,
      data
    );
    return response.data;
  }

  async update(data: UpdateCommercialProductDto): Promise<CommercialProduct> {
    const response = await this.api.put<CommercialProduct>(
      COMMERCIAL_PRODUCT_API_ROUTES.COMMERCIAL_PRODUCT_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      COMMERCIAL_PRODUCT_API_ROUTES.COMMERCIAL_PRODUCT_DELETE(id)
    );
  }
}
