export interface ExtraCharge {
  id: string;
  saleId: string;
  description: string;
  chargeAmount: number;
  expenseIncomeCode: string;

  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface CreateExtraChargeDto {
  saleId: string;
  description: string;
  chargeAmount: number;
  expenseIncomeCode: string;
}

export interface UpdateExtraChargeDto extends CreateExtraChargeDto {
  id: string;
}
