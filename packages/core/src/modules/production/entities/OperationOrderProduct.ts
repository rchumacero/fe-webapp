export interface OperationOrderProduct {
  id: string;
  operationOrderId: string;
  productId: string;
  requestedQuantity: number;
  producedQuantity?: number;
  defectedQuantity?: number;
  unitMeasureCode?: string;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateOperationOrderProductDto {
  operationOrderId: string;
  productId: string;
  requestedQuantity: number;
  producedQuantity?: number;
  defectedQuantity?: number;
  unitMeasureCode?: string;
  notes?: string;
}

export interface UpdateOperationOrderProductDto extends Partial<CreateOperationOrderProductDto> {
  id: string;
}
