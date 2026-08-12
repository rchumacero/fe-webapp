import { createApiClient } from "../../../api/client";
import { 
  ShoppingCartDetail, 
  CreateShoppingCartDetailDto, 
  UpdateShoppingCartDetailDto,
  IShoppingCartDetailRepository 
} from "@kplian/core";

export const SHOPPING_CART_DETAIL_API_ROUTES = {
  SHOPPING_CART_DETAIL: '/v1/shopping-cart-details',
  SHOPPING_CART_DETAIL_UPDATE: (id: string | number) => `/v1/shopping-cart-details/${id}`,
  SHOPPING_CART_DETAIL_DELETE: (id: string | number) => `/v1/shopping-cart-details/${id}`,
  SHOPPING_CART_DETAIL_BY_ID: (id: string | number) => `/v1/shopping-cart-details/${id}`,
};

export class ShoppingCartDetailRepositoryImpl implements IShoppingCartDetailRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<ShoppingCartDetail[]> {
    const response = await this.api.get<ShoppingCartDetail[]>(
      SHOPPING_CART_DETAIL_API_ROUTES.SHOPPING_CART_DETAIL
    );
    return response.data || [];
  }

  async getById(id: string): Promise<ShoppingCartDetail> {
    const response = await this.api.get<ShoppingCartDetail>(
      SHOPPING_CART_DETAIL_API_ROUTES.SHOPPING_CART_DETAIL_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateShoppingCartDetailDto): Promise<ShoppingCartDetail> {
    const response = await this.api.post<ShoppingCartDetail>(
      SHOPPING_CART_DETAIL_API_ROUTES.SHOPPING_CART_DETAIL,
      data
    );
    return response.data;
  }

  async update(data: UpdateShoppingCartDetailDto): Promise<ShoppingCartDetail> {
    const response = await this.api.put<ShoppingCartDetail>(
      SHOPPING_CART_DETAIL_API_ROUTES.SHOPPING_CART_DETAIL_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      SHOPPING_CART_DETAIL_API_ROUTES.SHOPPING_CART_DETAIL_DELETE(id)
    );
  }
}
