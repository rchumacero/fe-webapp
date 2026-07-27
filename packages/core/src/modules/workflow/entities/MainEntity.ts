export interface MainEntity {
  id: string;
  name: string;
  processName: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status: string;
}

export interface CreateMainEntityDto {
  name: string;
  processName: string;
  status?: string;
}

export interface UpdateMainEntityDto extends Partial<CreateMainEntityDto> {
  id: string;
}
