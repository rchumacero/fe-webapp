export interface Value {
  id: string;
  fieldId: string;
  taskId: string;
  value: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status: string;
}

export interface CreateValueDto {
  fieldId: string;
  taskId: string;
  value: string;
  status?: string;
}

export interface UpdateValueDto extends Partial<CreateValueDto> {
  id: string;
}
