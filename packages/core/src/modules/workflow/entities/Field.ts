export interface Field {
  id: string;
  formId: string;
  code: string;
  name: string;
  config?: string; // configuration JSON or description
  orderField: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status: string;
}

export interface CreateFieldDto {
  formId: string;
  code: string;
  name: string;
  config?: string;
  orderField: number;
  status?: string;
}

export interface UpdateFieldDto extends Partial<CreateFieldDto> {
  id: string;
}
