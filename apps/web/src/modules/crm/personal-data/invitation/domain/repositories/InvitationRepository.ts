import { Invitation, CreateInvitationDTO, UpdateInvitationDTO } from "../entities/Invitation";

export interface InvitationRepository {
  getAllByPersonId(personId: string, params?: { 
    page: number; 
    pageSize: number; 
    filter?: string;
  }): Promise<Invitation[]>;
  getById(id: string): Promise<Invitation>;
  create(data: CreateInvitationDTO): Promise<Invitation>;
  update(data: UpdateInvitationDTO): Promise<Invitation>;
  delete(id: string): Promise<void>;
}
