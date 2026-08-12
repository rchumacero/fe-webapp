import { 
  CustomerTicket, 
  CreateCustomerTicketDto, 
  UpdateCustomerTicketDto 
} from "../entities/CustomerTicket";

export interface ICustomerTicketRepository {
  getAll(): Promise<CustomerTicket[]>;
  getById(id: string): Promise<CustomerTicket>;
  create(data: CreateCustomerTicketDto): Promise<CustomerTicket>;
  update(data: UpdateCustomerTicketDto): Promise<CustomerTicket>;
  delete(id: string): Promise<void>;
}
