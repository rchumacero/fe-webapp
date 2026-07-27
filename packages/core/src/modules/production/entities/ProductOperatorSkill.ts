export interface ProductOperatorSkill {
  id: string;
  productConfigurationId: string;
  skillCode: string;
  quantity: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateProductOperatorSkillDto {
  productConfigurationId: string;
  skillCode: string;
  quantity: number;
}

export interface UpdateProductOperatorSkillDto extends Partial<CreateProductOperatorSkillDto> {
  id: string;
}
