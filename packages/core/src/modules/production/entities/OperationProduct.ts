export interface OperationProduct {
  id: string;
  operationId: string;
  productId: string;
  receiptQuantity?: number;
  totalProducedQuantity?: number;
  unitMeasureCode?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateOperationProductDto {
  operationId: string;
  productId: string;
  receiptQuantity?: number;
  totalProducedQuantity?: number;
  unitMeasureCode?: string;
}

export interface UpdateOperationProductDto extends Partial<CreateOperationProductDto> {
  id: string;
}
