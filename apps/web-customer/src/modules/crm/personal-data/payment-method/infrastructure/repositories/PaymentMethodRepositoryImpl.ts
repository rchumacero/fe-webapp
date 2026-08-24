import { createApiClient } from "@kplian/infrastructure";
import { PaymentMethod, CreatePaymentMethodDto, UpdatePaymentMethodDto } from "../../domain/entities/PaymentMethod";
import { PAYMENT_METHOD_API_ROUTES } from "../../routes/payment-method-routes";

export class PaymentMethodRepositoryImpl {
  private api = createApiClient('crm');

  async getAllByPersonId(personId: string): Promise<PaymentMethod[]> {
    const response = await this.api.get<PaymentMethod[]>(
      PAYMENT_METHOD_API_ROUTES.PAYMENT_METHOD_BY_PERSON_ID(personId)
    );
    return response.data || [];
  }

  async getById(id: string): Promise<PaymentMethod> {
    const response = await this.api.get<PaymentMethod>(
      PAYMENT_METHOD_API_ROUTES.PAYMENT_METHOD_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const response = await this.api.post<PaymentMethod>(
      PAYMENT_METHOD_API_ROUTES.PAYMENT_METHOD,
      data
    );
    return response.data;
  }

  async update(data: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const response = await this.api.put<PaymentMethod>(
      PAYMENT_METHOD_API_ROUTES.PAYMENT_METHOD_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      PAYMENT_METHOD_API_ROUTES.PAYMENT_METHOD_DELETE(id)
    );
  }
}
