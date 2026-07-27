export interface OperationUnit {
  id: string;
  vendorCode: string;
  code: string;
  status: string;
  organizationCode: string;
  warehouseMaterialCode: string;
  warehouseProductCode: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface CreateOperationUnitDto {
  vendorCode: string;
  code: string;
  status?: string;
  organizationCode: string;
  warehouseMaterialCode: string;
  warehouseProductCode: string;
}

export interface UpdateOperationUnitDto extends Partial<CreateOperationUnitDto> {
  id: string;
}
