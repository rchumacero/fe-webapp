export interface ProductItem {
  id: string;
  productConfigurationId: string;
  itemCode: string;
  quantity: number;
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

export interface CreateProductItemDto {
  productConfigurationId: string;
  itemCode: string;
  quantity: number;
  unitMeasureCode?: string;
  notes?: string;
}

export interface UpdateProductItemDto extends Partial<CreateProductItemDto> {
  id: string;
}
