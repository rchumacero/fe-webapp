import { Product, CreateProductDto, UpdateProductDto } from "../entities/Product";

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product>;
  getByCode(code: string): Promise<Product>;
  getByVendor(vendorCode: string): Promise<Product[]>;
  getByType(type: string): Promise<Product[]>;
  search(params: {
    vendorCode?: string;
    code?: string;
    name?: string;
    type?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<any>;
  create(data: CreateProductDto): Promise<Product>;
  update(data: UpdateProductDto): Promise<Product>;
  delete(id: string): Promise<void>;
  getConfigurationsByProductId(id: string): Promise<any[]>;
}
