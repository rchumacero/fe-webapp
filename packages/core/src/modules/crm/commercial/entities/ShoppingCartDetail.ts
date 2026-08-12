export class ShoppingCartDetail {
  id!: string;
  shoppingCartId!: string;
  commercialProductId!: string;
  scheduleId?: string | null;
  dateShopping!: Date;
  status!: string;
}

export interface CreateShoppingCartDetailDto {
  shoppingCartId: string;
  commercialProductId: string;
  scheduleId?: string | null;
  dateShopping: Date;
  status: string;
}

export interface UpdateShoppingCartDetailDto extends Partial<CreateShoppingCartDetailDto> {
  id: string;
}
