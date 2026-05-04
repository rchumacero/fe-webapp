export interface Invitation {
  id?: string;
  personId: string;
  url: string;
  fromDate: string;
  toDate: string;
  subjectNotify: string;
  bodyNotify: string;
  to: string;
  profiles: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export interface CreateInvitationDTO {
  personId: string;
  url: string;
  fromDate: string;
  toDate: string;
  subjectNotify: string;
  bodyNotify: string;
  to: string;
  profiles: string;
}

export interface UpdateInvitationDTO extends CreateInvitationDTO {
  id: string;
}