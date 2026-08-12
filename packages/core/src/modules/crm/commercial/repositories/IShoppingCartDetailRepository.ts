import { 
  ShoppingCartDetail, 
  CreateShoppingCartDetailDto, 
  UpdateShoppingCartDetailDto 
} from "../entities/ShoppingCartDetail";

export interface IShoppingCartDetailRepository {
  getAll(): Promise<ShoppingCartDetail[]>;
  getById(id: string): Promise<ShoppingCartDetail>;
  create(data: CreateShoppingCartDetailDto): Promise<ShoppingCartDetail>;
  update(data: UpdateShoppingCartDetailDto): Promise<ShoppingCartDetail>;
  delete(id: string): Promise<void>;
}
