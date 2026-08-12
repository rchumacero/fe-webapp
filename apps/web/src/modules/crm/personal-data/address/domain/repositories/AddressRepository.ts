import { Address, CreateAddressDto, UpdateAddressDto } from '../entities/Address';

export interface AddressRepository {
    getById(id: string): Promise<Address>;
    getByPersonId(personId: string): Promise<Address[]>;
    create(data: CreateAddressDto): Promise<Address>;
    update(data: UpdateAddressDto): Promise<Address>;
    delete(id: string): Promise<void>;
}
