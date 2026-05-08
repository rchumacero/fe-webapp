export interface Contact {
  id: string;
  personId: string;
  personCompId: string;
  type: string;
  relationDescription: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateContactDto {
  personId: string;
  personCompId: string;
  type: string;
  relationDescription: string;
}

export interface UpdateContactDto extends CreateContactDto {
  id: string;
}
