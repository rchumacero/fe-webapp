import { Identification, CreateIdentificationDto, UpdateIdentificationDto } from "../entities/Identification";

export interface IdentificationRepository {
    getAll(): Promise<Identification[]>;
    getByPersonId(personId: string): Promise<Identification[]>;
    getById(id: string): Promise<Identification>;
    create(data: CreateIdentificationDto): Promise<Identification>;
    update(data: UpdateIdentificationDto): Promise<Identification>;
    delete(id: string): Promise<void>;
}
