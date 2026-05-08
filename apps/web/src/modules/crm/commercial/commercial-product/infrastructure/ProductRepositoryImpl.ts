import { createApiClient } from "@kplian/infrastructure";
import { Product, CreateProductDto, UpdateProductDto } from "../domain/Product";
import { PRODUCT_API_ROUTES } from "../routes/product-routes";

export class ProductRepositoryImpl {
  private api = createApiClient('production');

  async getAll(personId: string): Promise<Product[]> {
    const response = await this.api.get<Product[]>(
      PRODUCT_API_ROUTES.PRODUCT_BY_PERSON_ID(personId)
    );
    return response.data || [];
  }

  async getById(id: string): Promise<Product> {
    const response = await this.api.get<Product>(
      PRODUCT_API_ROUTES.PRODUCT_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateProductDto): Promise<Product> {
    const response = await this.api.post<Product>(
      PRODUCT_API_ROUTES.PRODUCT,
      data
    );
    return response.data;
  }

  async update(data: UpdateProductDto): Promise<Product> {
    const response = await this.api.put<Product>(
      PRODUCT_API_ROUTES.PRODUCT_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      PRODUCT_API_ROUTES.PRODUCT_DELETE(id)
    );
  }
}
