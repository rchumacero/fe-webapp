import { CreateResourceDto, Resource, UpdateResourceDto } from "@kplian/core/src/modules/access/entities/Resource";
import { IResourceRepository } from "@kplian/core/src/modules/access/repositories/IResourceRepository";
import { createApiClient } from "../../api/client";


const RESOURCES_PATH = "/v1/resources";

export class ResourceRepositoryImpl implements IResourceRepository {

    private api = createApiClient("access");

    async findAll(): Promise<Resource[]> {
        const response = await this.api.get<Resource[]>(RESOURCES_PATH);
        return response.data;
    }

    async getById(id: string): Promise<Resource> {
        const response = await this.api.get<Resource>(`${RESOURCES_PATH}/${id}`);
        return response.data;
    }

    async getTreById(id: string): Promise<Resource[]> {
        const response = await this.api.get<Resource[]>(`${RESOURCES_PATH}/${id}/tree`);
        return response.data;
    }

    async getByChildrenById(id: string): Promise<Resource[]> {
        const response = await this.api.get<Resource[]>(`${RESOURCES_PATH}/${id}/children`);
        return response.data;
    }

    async create(data: CreateResourceDto): Promise<Resource> {
        const response = await this.api.post<Resource>(RESOURCES_PATH, data);
        return response.data;
    }

    async update(id: string, data: UpdateResourceDto): Promise<Resource> {
        const response = await this.api.put<Resource>(`${RESOURCES_PATH}/${id}`, data);
        return response.data;
    }
    
    async delete(id: string): Promise<void> {
        await this.api.delete(`${RESOURCES_PATH}/${id}`);
    }

}