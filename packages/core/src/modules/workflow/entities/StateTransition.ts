export interface StateTransition {
  id: string;
  initEntityStateId: string;
  endEntityStateId: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status: string;
  endpoint?: string;
  request?: string;
}

export interface CreateStateTransitionDto {
  initEntityStateId: string;
  endEntityStateId: string;
  status?: string;
  endpoint?: string;
  request?: string;
}

export interface UpdateStateTransitionDto extends Partial<CreateStateTransitionDto> {
  id: string;
}

