export interface TaskDigitalContent {
  id: string;
  taskId: string;
  digitalContentCode: string;
  priority: number;
  type: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status: string;
}

export interface CreateTaskDigitalContentDto {
  taskId: string;
  digitalContentCode: string;
  priority: number;
  type: string;
  status?: string;
}

export interface UpdateTaskDigitalContentDto extends Partial<CreateTaskDigitalContentDto> {
  id: string;
}
