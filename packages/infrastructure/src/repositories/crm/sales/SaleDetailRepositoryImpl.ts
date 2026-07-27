import { createApiClient } from "../../../api/client";
import { SaleDetail, CreateSaleDetailDto, UpdateSaleDetailDto, ISaleDetailRepository } from "@kplian/core";

export const SALE_DETAIL_API_ROUTES = {
  DETAIL: '/v1/sale-details',
  DETAIL_UPDATE: (id: string | number) => `/v1/sale-details/${id}`,
  DETAIL_DELETE: (id: string | number) => `/v1/sale-details/${id}`,
  DETAIL_BY_ID: (id: string | number) => `/v1/sale-details/${id}`,
};

export class SaleDetailRepositoryImpl implements ISaleDetailRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<SaleDetail[]> {
    const response = await this.api.get<SaleDetail[]>(
      SALE_DETAIL_API_ROUTES.DETAIL
    );
    return response.data || [];
  }

  async getBySaleId(saleId: string): Promise<SaleDetail[]> {
    const response = await this.api.get<SaleDetail[]>(
      SALE_DETAIL_API_ROUTES.DETAIL,
      { params: { filter: `saleId||$eq||${saleId}` } }
    );
    return response.data || [];
  }

  async getById(id: string): Promise<SaleDetail> {
    const response = await this.api.get<SaleDetail>(
      SALE_DETAIL_API_ROUTES.DETAIL_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateSaleDetailDto): Promise<SaleDetail> {
    const response = await this.api.post<SaleDetail>(
      SALE_DETAIL_API_ROUTES.DETAIL,
      data
    );
    return response.data;
  }

  async update(data: UpdateSaleDetailDto): Promise<SaleDetail> {
    const response = await this.api.put<SaleDetail>(
      SALE_DETAIL_API_ROUTES.DETAIL_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      SALE_DETAIL_API_ROUTES.DETAIL_DELETE(id)
    );
  }
}
