export interface CommunicationChannel {
  id: string;
  personId: string;
  type: string;
  contactData: string;
  kind: string;
  priority: number | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateCommunicationChannelDto {
  personId: string;
  type: string;
  contactData: string;
  kind: string;
  priority?: number | null;
}

export interface UpdateCommunicationChannelDto extends CreateCommunicationChannelDto {
  id: string;
}
