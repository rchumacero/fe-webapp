import { CreateResourceDto, Resource, UpdateResourceDto } from "../entities/Resource"

export interface IResourceRepository {
    findAll(): Promise<Resource[]>;
    getById(id: string): Promise<Resource>;
    getTreById(id: string): Promise<Resource[]>;
    getByChildrenById(id: string): Promise<Resource[]>;
    create(data: CreateResourceDto): Promise<Resource>;
    update(id: string, data: UpdateResourceDto): Promise<Resource>;
    delete(id: string): Promise<void>;
}