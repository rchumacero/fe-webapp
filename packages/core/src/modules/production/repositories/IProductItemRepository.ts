import { ProductItem, CreateProductItemDto, UpdateProductItemDto } from "../entities/ProductItem";

export interface IProductItemRepository {
  getAll(): Promise<ProductItem[]>;
  getById(id: string): Promise<ProductItem>;
  create(data: CreateProductItemDto): Promise<ProductItem>;
  update(data: UpdateProductItemDto): Promise<ProductItem>;
  delete(id: string): Promise<void>;
}
