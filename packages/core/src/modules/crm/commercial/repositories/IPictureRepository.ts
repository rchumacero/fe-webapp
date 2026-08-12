import { 
  Picture, 
  CreatePictureDto, 
  UpdatePictureDto 
} from "../entities/Picture";

export interface IPictureRepository {
  getAll(): Promise<Picture[]>;
  getById(id: string): Promise<Picture>;
  create(data: CreatePictureDto): Promise<Picture>;
  update(data: UpdatePictureDto): Promise<Picture>;
  delete(id: string): Promise<void>;
}
