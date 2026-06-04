export interface Case {
  id: string;
  vendorCode: string;
  processCode: string;
  moduleCode: string;
  entity: string;
  entityId: string;
  entityExpense?: string;
  entityExpenseId?: string;
  instanceId?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status: string;
}

export interface CreateCaseDto {
  vendorCode: string;
  processCode: string;
  moduleCode: string;
  entity: string;
  entityId: string;
  entityExpense?: string;
  entityExpenseId?: string;
  status?: string;
}

export interface UpdateCaseDto extends Partial<CreateCaseDto> {
  id: string;
}
