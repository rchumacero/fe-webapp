import { 
  Contract, 
  CreateContractDto, 
  UpdateContractDto 
} from "../entities/Contract";

export interface IContractRepository {
  getAll(): Promise<Contract[]>;
  getById(id: string): Promise<Contract>;
  create(data: CreateContractDto): Promise<Contract>;
  update(data: UpdateContractDto): Promise<Contract>;
  delete(id: string): Promise<void>;
}
