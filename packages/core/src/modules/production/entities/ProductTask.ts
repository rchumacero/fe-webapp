export interface ProductTask {
  id: string;
  productConfigurationId: string;
  name: string;
  description?: string;
  order: number;
  estimatedHours?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateProductTaskDto {
  productConfigurationId: string;
  name: string;
  description?: string;
  order: number;
  estimatedHours?: number;
}

export interface UpdateProductTaskDto extends Partial<CreateProductTaskDto> {
  id: string;
}
