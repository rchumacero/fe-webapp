import { ProductTask, CreateProductTaskDto, UpdateProductTaskDto } from "../entities/ProductTask";

export interface IProductTaskRepository {
  getAll(): Promise<ProductTask[]>;
  getById(id: string): Promise<ProductTask>;
  create(data: CreateProductTaskDto): Promise<ProductTask>;
  update(data: UpdateProductTaskDto): Promise<ProductTask>;
  delete(id: string): Promise<void>;
}
