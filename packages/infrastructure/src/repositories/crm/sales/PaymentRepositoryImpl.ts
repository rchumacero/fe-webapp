import { createApiClient } from "../../../api/client";
import { Payment, CreatePaymentDto, UpdatePaymentDto, IPaymentRepository } from "@kplian/core";

export const PAYMENT_API_ROUTES = {
  PAYMENT: '/v1/payments',
  PAYMENT_UPDATE: (id: string | number) => `/v1/payments/${id}`,
  PAYMENT_DELETE: (id: string | number) => `/v1/payments/${id}`,
  PAYMENT_BY_ID: (id: string | number) => `/v1/payments/${id}`,
};

export class PaymentRepositoryImpl implements IPaymentRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<Payment[]> {
    const response = await this.api.get<Payment[]>(
      PAYMENT_API_ROUTES.PAYMENT
    );
    return response.data || [];
  }

  async getBySaleId(saleId: string): Promise<Payment[]> {
    const response = await this.api.get<Payment[]>(
      PAYMENT_API_ROUTES.PAYMENT,
      { params: { filter: `saleId||$eq||${saleId}` } }
    );
    return response.data || [];
  }

  async getById(id: string): Promise<Payment> {
    const response = await this.api.get<Payment>(
      PAYMENT_API_ROUTES.PAYMENT_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreatePaymentDto): Promise<Payment> {
    const response = await this.api.post<Payment>(
      PAYMENT_API_ROUTES.PAYMENT,
      data
    );
    return response.data;
  }

  async update(data: UpdatePaymentDto): Promise<Payment> {
    const response = await this.api.put<Payment>(
      PAYMENT_API_ROUTES.PAYMENT_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      PAYMENT_API_ROUTES.PAYMENT_DELETE(id)
    );
  }
}
