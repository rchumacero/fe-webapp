export interface Schedule {
  id: string;
  commercialProductId: string;
  organizationId: string;
  collaboratorId: string;
  dayCode: string;
  fromTime: string;
  toTime: string;
  quantity: number;
  unitMeasureCode: string;
  deletedAt?: null;
  deletedBy?: null;
  status?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateScheduleDto {
  personId: string;
  personCompId: string;
  type: string;
  relationDescription: string;
}

export interface UpdateScheduleDto extends CreateScheduleDto {
  id: string;
}
