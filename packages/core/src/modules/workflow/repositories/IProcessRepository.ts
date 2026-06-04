import { Process, CreateProcessDto, UpdateProcessDto } from "../entities/Process";

export interface IProcessRepository {
    getAll(): Promise<Process[]>;
    getById(id: string): Promise<Process>;
    create(data: CreateProcessDto): Promise<Process>;
    update(data: UpdateProcessDto): Promise<Process>;
    delete(id: string): Promise<void>;
}
