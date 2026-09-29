export interface Product {
  id: string;
  vendorCode: string;
  code: string;
  name: string;
  type?: string;
  description?: string;
  unitMeasureCode?: string;
  itemCode?: string;
  version?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateProductDto {
  vendorCode: string;
  code: string;
  name: string;
  type?: string;
  description?: string;
  unitMeasureCode?: string;
  itemCode?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}

export interface ProductVersionDto {
  id?: string;
  code: string;
  name: string;
  description?: string;
  codeConfiguration?: string;
  configurationCode?: string;
  version?: string;
  unitMeasureCode?: string;
}

