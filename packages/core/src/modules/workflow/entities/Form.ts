export interface Form {
  id: string;
  vendorCode: string;
  moduleCode: string;
  name: string;
  code: string;
  description?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status: string;
}

export interface CreateFormDto {
  vendorCode: string;
  moduleCode: string;
  name: string;
  code: string;
  description?: string;
  status?: string;
}

export interface UpdateFormDto extends Partial<CreateFormDto> {
  id: string;
}
