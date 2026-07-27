export interface Payment {
  id: string;
  saleId: string;
  paymentDate: string;
  order: number;
  priceAmount: number;
  interestAmount: number;
  status: string;

  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface CreatePaymentDto {
  saleId: string;
  paymentDate: string;
  order: number;
  priceAmount: number;
  interestAmount: number;
  status: string;
}

export interface UpdatePaymentDto extends CreatePaymentDto {
  id: string;
}
