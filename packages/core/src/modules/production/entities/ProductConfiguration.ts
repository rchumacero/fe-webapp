import { ProductItem } from "./ProductItem";
import { ProductTask } from "./ProductTask";
import { ProductVariable } from "./ProductVariable";
import { ProductOperatorSkill } from "./ProductOperatorSkill";

export interface ProductConfiguration {
  id: string;
  productId: string;
  code: string;
  version: string;
  fromDate: string;
  toDate?: string;
  productQuantityByRecipe?: number;
  items?: ProductItem[];
  tasks?: ProductTask[];
  variables?: ProductVariable[];
  productOperatorSkills?: ProductOperatorSkill[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateProductConfigurationDto {
  productId: string;
  code: string;
  version: string;
  fromDate: string;
  toDate?: string;
  productQuantityByRecipe?: number;
}

export interface UpdateProductConfigurationDto extends Partial<CreateProductConfigurationDto> {
  id: string;
}
