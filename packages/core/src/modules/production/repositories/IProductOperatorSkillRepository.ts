import { ProductOperatorSkill, CreateProductOperatorSkillDto, UpdateProductOperatorSkillDto } from "../entities/ProductOperatorSkill";

export interface IProductOperatorSkillRepository {
  getAll(): Promise<ProductOperatorSkill[]>;
  getById(id: string): Promise<ProductOperatorSkill>;
  create(data: CreateProductOperatorSkillDto): Promise<ProductOperatorSkill>;
  update(data: UpdateProductOperatorSkillDto): Promise<ProductOperatorSkill>;
  delete(id: string): Promise<void>;
}
