export class ShoppingCart {
  id!: string;
  vendorId!: string;
  customerId!: string;
  shoppingDate!: Date;
  status!: string;
}

export interface CreateShoppingCartDto {
  vendorId: string;
  customerId: string;
  shoppingDate: Date;
  status: string;
}

export interface UpdateShoppingCartDto extends Partial<CreateShoppingCartDto> {
  id: string;
}
