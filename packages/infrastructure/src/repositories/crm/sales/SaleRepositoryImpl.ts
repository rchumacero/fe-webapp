import { createApiClient } from "../../../api/client";
import { Sale, CreateSaleDto, UpdateSaleDto, ISaleRepository } from "@kplian/core";

export const SALE_API_ROUTES = {
  SALE: '/v1/sales',
  SALE_UPDATE: (id: string | number) => `/v1/sales/${id}`,
  SALE_DELETE: (id: string | number) => `/v1/sales/${id}`,
  SALE_BY_ID: (id: string | number) => `/v1/sales/${id}`,
};

export class SaleRepositoryImpl implements ISaleRepository {
  private api = createApiClient('crm');

  async getAll(params?: {
    vendorId?: string;
    customerId?: string;
    page?: number;
    size?: number;
    filter?: string;
  }): Promise<Sale[]> {
    const response = await this.api.get<Sale[]>(
      SALE_API_ROUTES.SALE,
      { params }
    );
    return response.data || [];
  }

  async getById(id: string): Promise<Sale> {
    const response = await this.api.get<Sale>(
      SALE_API_ROUTES.SALE_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateSaleDto): Promise<Sale> {
    const response = await this.api.post<Sale>(
      SALE_API_ROUTES.SALE,
      data
    );
    return response.data;
  }

  async update(data: UpdateSaleDto): Promise<Sale> {
    const response = await this.api.put<Sale>(
      SALE_API_ROUTES.SALE_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      SALE_API_ROUTES.SALE_DELETE(id)
    );
  }
}
