export interface Product {
  id: string;
  vendorCode?: string;
  code?: string;
  name?: string;
  type?: string;
  description?: string;
  unitMeasureCode?: string;
  itemCode?: string;
  version?: string;
  deletedAt?: null;
  deletedBy?: null;
  status?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateProductDto {
  vendorCode?: string;
  code?: string;
  name?: string;
  type?: string;
  description?: string;
  unitMeasureCode?: string;
  itemCode?: string;
  personId?: string;
  personCompId?: string;
  relationDescription?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}

