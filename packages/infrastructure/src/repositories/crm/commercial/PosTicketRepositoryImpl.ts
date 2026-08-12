import { createApiClient } from "../../../api/client";
import { 
  PosTicket, 
  CreatePosTicketDto, 
  UpdatePosTicketDto,
  IPosTicketRepository 
} from "@kplian/core";

export const POS_TICKET_API_ROUTES = {
  POS_TICKET: '/v1/pos-tickets',
  POS_TICKET_UPDATE: (id: string | number) => `/v1/pos-tickets/${id}`,
  POS_TICKET_DELETE: (id: string | number) => `/v1/pos-tickets/${id}`,
  POS_TICKET_BY_ID: (id: string | number) => `/v1/pos-tickets/${id}`,
};

export class PosTicketRepositoryImpl implements IPosTicketRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<PosTicket[]> {
    const response = await this.api.get<PosTicket[]>(
      POS_TICKET_API_ROUTES.POS_TICKET
    );
    return response.data || [];
  }

  async getById(id: string): Promise<PosTicket> {
    const response = await this.api.get<PosTicket>(
      POS_TICKET_API_ROUTES.POS_TICKET_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreatePosTicketDto): Promise<PosTicket> {
    const response = await this.api.post<PosTicket>(
      POS_TICKET_API_ROUTES.POS_TICKET,
      data
    );
    return response.data;
  }

  async update(data: UpdatePosTicketDto): Promise<PosTicket> {
    const response = await this.api.put<PosTicket>(
      POS_TICKET_API_ROUTES.POS_TICKET_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      POS_TICKET_API_ROUTES.POS_TICKET_DELETE(id)
    );
  }
}
