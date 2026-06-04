export interface Forward {
  id: string;
  taskId: string;
  collaboratorCode: string;
  forwardDate: string;
  actionCode: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status: string;
}

export interface CreateForwardDto {
  taskId: string;
  collaboratorCode: string;
  forwardDate: string;
  actionCode: string;
  status?: string;
}

export interface UpdateForwardDto extends Partial<CreateForwardDto> {
  id: string;
}
