export interface PaymentMethod {
  id: string;
  personId: string;
  name: string;
  type: string;
  paymentData: string;
  priority: number | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreatePaymentMethodDto {
  personId: string;
  name: string;
  type: string;
  paymentData: string;
  priority?: number | null;
}

export interface UpdatePaymentMethodDto extends CreatePaymentMethodDto {
  id: string;
}
