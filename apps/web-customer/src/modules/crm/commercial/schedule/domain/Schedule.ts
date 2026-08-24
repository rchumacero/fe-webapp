export class Schedule {
  id!: string;
  organizationId!: string;
  collaboratorId?: string | null;
  commercialProductId?: string | null;
  fromDate!: Date;
  toDate!: Date;
  status!: string;
  quantity?: number | null;
  until?: Date | null;
  type?: string | null;
  notes?: string | null;
}

export interface CreateScheduleDto {
  organizationId: string;
  collaboratorId?: string | null;
  commercialProductId?: string | null;
  fromDate: Date;
  toDate: Date;
  status: string;
  quantity?: number | null;
  until?: Date | null;
  type?: string | null;
  notes?: string | null;
}

export interface UpdateScheduleDto extends Partial<CreateScheduleDto> {
  id: string;
}
