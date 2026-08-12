export class CustomerTicket {
  id!: string;
  commercialProductId!: string;
  customerId?: string | null;
  ticketDate!: Date;
  ticketNumber!: string;
  status!: string;
  priorityCode?: string | null;
}

export interface CreateCustomerTicketDto {
  commercialProductId: string;
  customerId?: string | null;
  ticketDate: Date;
  ticketNumber: string;
  status: string;
  priorityCode?: string | null;
}

export interface UpdateCustomerTicketDto extends Partial<CreateCustomerTicketDto> {
  id: string;
}
