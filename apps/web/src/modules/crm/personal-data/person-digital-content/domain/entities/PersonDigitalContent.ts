export interface PersonDigitalContent {
  id: string;
  personId: string;
  digitalContentCode: string;
  type: string;
  priority: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreatePersonDigitalContentDto {
  personId: string;
  digitalContentCode: string;
  type: string;
  priority: number;
}

export interface UpdatePersonDigitalContentDto extends CreatePersonDigitalContentDto {
  id: string;
}
