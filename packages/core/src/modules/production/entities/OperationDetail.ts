export interface OperationDetail {
  id: string;
  operationId: string;
  operationOrderId: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateOperationDetailDto {
  operationId: string;
  operationOrderId: string;
}

export interface UpdateOperationDetailDto extends Partial<CreateOperationDetailDto> {
  id: string;
}
