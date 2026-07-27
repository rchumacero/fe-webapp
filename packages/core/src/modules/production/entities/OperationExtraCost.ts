export interface OperationExtraCost {
  id: string;
  operationId: string;
  costCode: string;
  amount: number;
  currencyCode: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateOperationExtraCostDto {
  operationId: string;
  costCode: string;
  amount: number;
  currencyCode: string;
}

export interface UpdateOperationExtraCostDto extends Partial<CreateOperationExtraCostDto> {
  id: string;
}
