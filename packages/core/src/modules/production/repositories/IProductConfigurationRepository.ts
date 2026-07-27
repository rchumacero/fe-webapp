import { ProductConfiguration, CreateProductConfigurationDto, UpdateProductConfigurationDto } from "../entities/ProductConfiguration";

export interface IProductConfigurationRepository {
  getAll(): Promise<ProductConfiguration[]>;
  getById(id: string): Promise<ProductConfiguration>;
  getByProductId(productId: string): Promise<ProductConfiguration[]>;
  create(data: CreateProductConfigurationDto): Promise<ProductConfiguration>;
  update(data: UpdateProductConfigurationDto): Promise<ProductConfiguration>;
  delete(id: string): Promise<void>;
  getItemsByConfigId(id: string): Promise<any[]>;
  getTasksByConfigId(id: string): Promise<any[]>;
  getVariablesByConfigId(id: string): Promise<any[]>;
  getOperatorSkillsByConfigId(id: string): Promise<any[]>;
}
