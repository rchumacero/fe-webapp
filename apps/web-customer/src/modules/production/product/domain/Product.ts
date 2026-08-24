export interface Product {
  id: string;
  vendorCode?: string;
  code?: string;
  name?: string;
  type?: string;
  description?: string;
  unitMeasureCode?: string;
  deletedAt?: null;
  deletedBy?: null;
  status?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateProductDto {
  personId: string;
  personCompId: string;
  type: string;
  relationDescription: string;
}

export interface UpdateProductDto extends CreateProductDto {
  id: string;
}
