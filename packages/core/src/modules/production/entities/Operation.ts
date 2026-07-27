export interface Operation {
  id: string;
  vendorCode: string;
  operationDate: string;
  deliveryDate: string;
  status: string;
  warehouseMaterialCode: string;
  warehouseProductCode: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface CreateOperationDto {
  vendorCode: string;
  operationDate: string;
  deliveryDate: string;
  status?: string;
  warehouseMaterialCode: string;
  warehouseProductCode: string;
}

export interface UpdateOperationDto extends Partial<CreateOperationDto> {
  id: string;
}
