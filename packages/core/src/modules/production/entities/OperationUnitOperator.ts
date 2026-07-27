export interface OperationUnitOperator {
  id: string;
  operationUnitId: string;
  personCode: string;
  skillCode: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateOperationUnitOperatorDto {
  operationUnitId: string;
  personCode: string;
  skillCode: string;
}

export interface UpdateOperationUnitOperatorDto extends Partial<CreateOperationUnitOperatorDto> {
  id: string;
}
