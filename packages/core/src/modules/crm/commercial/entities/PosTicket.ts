export class PosTicket {
  id!: string;
  organizationId!: string;
  customerTicketId!: string;
  status!: string;
  attentionDate!: Date;
}

export interface CreatePosTicketDto {
  organizationId: string;
  customerTicketId: string;
  status: string;
  attentionDate: Date;
}

export interface UpdatePosTicketDto extends Partial<CreatePosTicketDto> {
  id: string;
}
