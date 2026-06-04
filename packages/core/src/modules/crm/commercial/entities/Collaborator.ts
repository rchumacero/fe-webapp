export class Collaborator {
  id!: string;
  commercialProductId!: string;
  employeeId!: string;
  type?: string | null;
  status!: string;
  feeAmount?: number | null;
  currencyCode?: string | null;
  appointmentTime?: string | null;
  unitMeasureCode?: string | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateCollaboratorDto {
  commercialProductId: string;
  employeeId: string;
  type?: string | null;
  status: string;
  feeAmount?: number | null;
  currencyCode?: string | null;
  appointmentTime?: string | null;
  unitMeasureCode?: string | null;
}

export interface UpdateCollaboratorDto extends Partial<CreateCollaboratorDto> {
  id: string;
}
