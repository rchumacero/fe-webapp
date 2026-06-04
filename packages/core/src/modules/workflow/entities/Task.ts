export interface Task {
  id: string;
  caseId: string;
  taskId?: string; // Self-referencing task or parent task id
  taskCode: string;
  taskDate: string;
  collaboratorCode: string;
  receivedOrder: number;
  sendOrder: number;
  notes?: string;
  taskInstanceId?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status: string;
  formCode?: string;
  outputVariables?: Record<string, { type: string; value: any; valueInfo?: any }>;
}

export interface CreateTaskDto {
  caseId: string;
  taskId?: string;
  taskCode: string;
  taskDate: string;
  collaboratorCode: string;
  receivedOrder: number;
  sendOrder: number;
  notes?: string;
  status?: string;
  formCode?: string;
  outputVariables?: Record<string, { type: string; value: any; valueInfo?: any }>;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  id: string;
}

