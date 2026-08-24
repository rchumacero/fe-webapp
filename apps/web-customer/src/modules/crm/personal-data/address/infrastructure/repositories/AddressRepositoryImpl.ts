import { createApiClient } from '@kplian/infrastructure';
import { Address, CreateAddressDto, UpdateAddressDto } from '../domain/entities/Address';
import { AddressRepository } from '../domain/repositories/AddressRepository';

export class AddressRepositoryImpl implements AddressRepository {
    private api = createApiClient('crm');

    async getById(id: string): Promise<Address> {
        const response = await this.api.get<Address>(`/v1/addresses/${id}`);
        return response.data;
    }

    async getByPersonId(personId: string): Promise<Address[]> {
        const response = await this.api.get<Address[]>(`/v1/persons/${personId}/addresses`);
        return response.data || [];
    }

    async create(data: CreateAddressDto): Promise<Address> {
        const response = await this.api.post<Address>('/v1/addresses', data);
        return response.data;
    }

    async update(data: UpdateAddressDto): Promise<Address> {
        const { id, ...rest } = data;
        const response = await this.api.put<Address>(`/v1/addresses/${id}`, rest);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await this.api.delete(`/v1/addresses/${id}`);
    }
}
