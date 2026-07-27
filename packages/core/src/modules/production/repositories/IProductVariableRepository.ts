import { ProductVariable, CreateProductVariableDto, UpdateProductVariableDto } from "../entities/ProductVariable";

export interface IProductVariableRepository {
  getAll(): Promise<ProductVariable[]>;
  getById(id: string): Promise<ProductVariable>;
  create(data: CreateProductVariableDto): Promise<ProductVariable>;
  update(data: UpdateProductVariableDto): Promise<ProductVariable>;
  delete(id: string): Promise<void>;
  getRulesByVendor(vendorCode: string): Promise<any[]>;
}
