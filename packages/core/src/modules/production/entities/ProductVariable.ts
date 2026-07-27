export interface ProductVariable {
  id: string;
  productConfigurationId: string;
  name: string;
  value?: string;
  order: number;
  type: string;
  businessRuleCode?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateProductVariableDto {
  productConfigurationId: string;
  name: string;
  value?: string;
  order: number;
  type: string;
  businessRuleCode?: string;
}

export interface UpdateProductVariableDto extends Partial<CreateProductVariableDto> {
  id: string;
}
