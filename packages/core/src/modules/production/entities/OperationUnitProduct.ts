export interface OperationUnitProduct {
  id: string;
  operationUnitId: string;
  productId: string;
  maxRecipeQuantity: number;
  minRecipeQuantity: number;
  unitMeasureCode: string;
  estimatedHours: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateOperationUnitProductDto {
  operationUnitId: string;
  productId: string;
  maxRecipeQuantity: number;
  minRecipeQuantity: number;
  unitMeasureCode: string;
  estimatedHours: number;
}

export interface UpdateOperationUnitProductDto extends Partial<CreateOperationUnitProductDto> {
  id: string;
}
