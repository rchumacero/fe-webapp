export interface OperationProductOperator {
  id: string;
  operationProductId: string;
  skillCode: string;
  quantity: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateOperationProductOperatorDto {
  operationProductId: string;
  skillCode: string;
  quantity: number;
}

export interface UpdateOperationProductOperatorDto extends Partial<CreateOperationProductOperatorDto> {
  id: string;
}
