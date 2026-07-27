import { MainEntity, CreateMainEntityDto, UpdateMainEntityDto } from "../entities/MainEntity";

export interface IMainEntityRepository {
  getAll(): Promise<MainEntity[]>;
  getById(id: string): Promise<MainEntity>;
  create(data: CreateMainEntityDto): Promise<MainEntity>;
  update(data: UpdateMainEntityDto): Promise<MainEntity>;
  delete(id: string): Promise<void>;
}
