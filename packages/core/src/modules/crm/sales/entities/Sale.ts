import { SaleDetail } from "./SaleDetail";
import { ExtraCharge } from "./ExtraCharge";
import { Payment } from "./Payment";

export interface Sale {
  id: string;
  vendorId: string;
  customerId: string;
  saleDate: string;
  customerName: string;
  customerDocumentNumber: string;
  status: string;
  paymentMethodCode: string;
  currencyCode: string;
  
  details?: SaleDetail[];
  extraCharges?: ExtraCharge[];
  payments?: Payment[];

  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface CreateSaleDto {
  vendorId: string;
  customerId: string;
  saleDate: string;
  customerName: string;
  customerDocumentNumber: string;
  status: string;
  paymentMethodCode: string;
  currencyCode: string;
}

export interface UpdateSaleDto extends CreateSaleDto {
  id: string;
}
