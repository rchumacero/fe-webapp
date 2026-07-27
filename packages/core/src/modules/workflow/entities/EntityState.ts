export interface EntityState {
  id: string;
  mainEntityId: string;
  code: string;
  name: string;
  type: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status: string;
}

export interface CreateEntityStateDto {
  mainEntityId: string;
  code: string;
  name: string;
  type: string;
  status?: string;
}

export interface UpdateEntityStateDto extends Partial<CreateEntityStateDto> {
  id: string;
}
