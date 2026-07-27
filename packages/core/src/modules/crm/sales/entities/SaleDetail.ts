export interface SaleDetail {
  id: string;
  saleId: string;
  shoppingCartDetailId?: string | null;
  expenseIncomeCode: string;
  notes: string;
  quantity: number;
  unitMeasureCode: string;
  costAmount: number;
  revenueAmount: number;
  discountAmount: number;
  priceAmount: number;
  status: string;

  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface CreateSaleDetailDto {
  saleId: string;
  shoppingCartDetailId?: string | null;
  expenseIncomeCode: string;
  notes: string;
  quantity: number;
  unitMeasureCode: string;
  costAmount: number;
  revenueAmount: number;
  discountAmount: number;
  priceAmount: number;
  status: string;
}

export interface UpdateSaleDetailDto extends CreateSaleDetailDto {
  id: string;
}
