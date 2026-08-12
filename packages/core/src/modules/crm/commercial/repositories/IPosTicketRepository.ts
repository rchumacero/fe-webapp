import { 
  PosTicket, 
  CreatePosTicketDto, 
  UpdatePosTicketDto 
} from "../entities/PosTicket";

export interface IPosTicketRepository {
  getAll(): Promise<PosTicket[]>;
  getById(id: string): Promise<PosTicket>;
  create(data: CreatePosTicketDto): Promise<PosTicket>;
  update(data: UpdatePosTicketDto): Promise<PosTicket>;
  delete(id: string): Promise<void>;
}
