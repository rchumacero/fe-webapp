import { createApiClient } from "../../api/client";
import { IMenuRepository, MenuResponseDTO } from "@kplian/core";

const RESOURCES_PATH = "/v1/menus";

export class MenuRepositoryImpl implements IMenuRepository {

    private api = createApiClient("access");

    async findAll(): Promise<MenuResponseDTO[]> {
        const response = await this.api.get<MenuResponseDTO[]>(RESOURCES_PATH);
        return response.data;
    }
}