export interface WorkExperience {
  id: string;
  personId: string;
  name: string;
  positionCode: string;
  description: string;
  fromDate: string;
  toDate: string | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateWorkExperienceDto {
  personId: string;
  name: string;
  positionCode: string;
  description: string;
  fromDate: string;
  toDate?: string | null;
}

export interface UpdateWorkExperienceDto extends CreateWorkExperienceDto {
  id: string;
}
