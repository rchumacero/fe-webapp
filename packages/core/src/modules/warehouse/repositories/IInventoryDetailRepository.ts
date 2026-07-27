import { InventoryDetail, CreateInventoryDetailDto, UpdateInventoryDetailDto } from "../entities/InventoryDetail";

export interface IInventoryDetailRepository {
  getAll(): Promise<InventoryDetail[]>;
  getById(id: string): Promise<InventoryDetail>;
  getByInventory(inventoryId: string): Promise<InventoryDetail[]>;
  getByItemCode(itemCode: string): Promise<InventoryDetail[]>;
  create(data: CreateInventoryDetailDto): Promise<InventoryDetail>;
  update(data: UpdateInventoryDetailDto): Promise<InventoryDetail>;
  delete(id: string): Promise<void>;
}
