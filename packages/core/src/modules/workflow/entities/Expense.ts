export interface Expense {
  id: string;
  caseId: string;
  expenseCode: string;
  description?: string;
  amount: number;
  currencyCode: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status: string;
}

export interface CreateExpenseDto {
  caseId: string;
  expenseCode: string;
  description?: string;
  amount: number;
  currencyCode: string;
  status?: string;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {
  id: string;
}
