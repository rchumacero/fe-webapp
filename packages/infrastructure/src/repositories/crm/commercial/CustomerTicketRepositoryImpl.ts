import { createApiClient } from "../../../api/client";
import { 
  CustomerTicket, 
  CreateCustomerTicketDto, 
  UpdateCustomerTicketDto,
  ICustomerTicketRepository 
} from "@kplian/core";

export const CUSTOMER_TICKET_API_ROUTES = {
  CUSTOMER_TICKET: '/v1/customer-tickets',
  CUSTOMER_TICKET_UPDATE: (id: string | number) => `/v1/customer-tickets/${id}`,
  CUSTOMER_TICKET_DELETE: (id: string | number) => `/v1/customer-tickets/${id}`,
  CUSTOMER_TICKET_BY_ID: (id: string | number) => `/v1/customer-tickets/${id}`,
};

export class CustomerTicketRepositoryImpl implements ICustomerTicketRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<CustomerTicket[]> {
    const response = await this.api.get<CustomerTicket[]>(
      CUSTOMER_TICKET_API_ROUTES.CUSTOMER_TICKET
    );
    return response.data || [];
  }

  async getById(id: string): Promise<CustomerTicket> {
    const response = await this.api.get<CustomerTicket>(
      CUSTOMER_TICKET_API_ROUTES.CUSTOMER_TICKET_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateCustomerTicketDto): Promise<CustomerTicket> {
    const response = await this.api.post<CustomerTicket>(
      CUSTOMER_TICKET_API_ROUTES.CUSTOMER_TICKET,
      data
    );
    return response.data;
  }

  async update(data: UpdateCustomerTicketDto): Promise<CustomerTicket> {
    const response = await this.api.put<CustomerTicket>(
      CUSTOMER_TICKET_API_ROUTES.CUSTOMER_TICKET_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      CUSTOMER_TICKET_API_ROUTES.CUSTOMER_TICKET_DELETE(id)
    );
  }
}
