import { MenuResponseDTO } from "../entities/Menu";

export interface IMenuRepository {
    findAll(): Promise<MenuResponseDTO[]>;
}