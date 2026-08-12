import { createApiClient } from "../../../api/client";
import { 
  ShoppingCart, 
  CreateShoppingCartDto, 
  UpdateShoppingCartDto,
  IShoppingCartRepository 
} from "@kplian/core";

export const SHOPPING_CART_API_ROUTES = {
  SHOPPING_CART: '/v1/shopping-carts',
  SHOPPING_CART_UPDATE: (id: string | number) => `/v1/shopping-carts/${id}`,
  SHOPPING_CART_DELETE: (id: string | number) => `/v1/shopping-carts/${id}`,
  SHOPPING_CART_BY_ID: (id: string | number) => `/v1/shopping-carts/${id}`,
};

export class ShoppingCartRepositoryImpl implements IShoppingCartRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<ShoppingCart[]> {
    const response = await this.api.get<ShoppingCart[]>(
      SHOPPING_CART_API_ROUTES.SHOPPING_CART
    );
    return response.data || [];
  }

  async getById(id: string): Promise<ShoppingCart> {
    const response = await this.api.get<ShoppingCart>(
      SHOPPING_CART_API_ROUTES.SHOPPING_CART_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateShoppingCartDto): Promise<ShoppingCart> {
    const response = await this.api.post<ShoppingCart>(
      SHOPPING_CART_API_ROUTES.SHOPPING_CART,
      data
    );
    return response.data;
  }

  async update(data: UpdateShoppingCartDto): Promise<ShoppingCart> {
    const response = await this.api.put<ShoppingCart>(
      SHOPPING_CART_API_ROUTES.SHOPPING_CART_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      SHOPPING_CART_API_ROUTES.SHOPPING_CART_DELETE(id)
    );
  }
}
