import { 
  Collaborator, 
  CreateCollaboratorDto, 
  UpdateCollaboratorDto 
} from "../entities/Collaborator";

export interface ICollaboratorRepository {
  getAll(): Promise<Collaborator[]>;
  getByCommercialProductId(commercialProductId: string): Promise<Collaborator[]>;
  getById(id: string): Promise<Collaborator>;
  create(data: CreateCollaboratorDto): Promise<Collaborator>;
  update(data: UpdateCollaboratorDto): Promise<Collaborator>;
  delete(id: string): Promise<void>;
}
