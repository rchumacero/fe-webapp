import { 
  ShoppingCart, 
  CreateShoppingCartDto, 
  UpdateShoppingCartDto 
} from "../entities/ShoppingCart";

export interface IShoppingCartRepository {
  getAll(): Promise<ShoppingCart[]>;
  getById(id: string): Promise<ShoppingCart>;
  create(data: CreateShoppingCartDto): Promise<ShoppingCart>;
  update(data: UpdateShoppingCartDto): Promise<ShoppingCart>;
  delete(id: string): Promise<void>;
}
