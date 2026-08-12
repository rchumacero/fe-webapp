import { createApiClient } from "../../../api/client";
import { 
  Contract, 
  CreateContractDto, 
  UpdateContractDto,
  IContractRepository 
} from "@kplian/core";

export const CONTRACT_API_ROUTES = {
  CONTRACT: '/v1/contracts',
  CONTRACT_UPDATE: (id: string | number) => `/v1/contracts/${id}`,
  CONTRACT_DELETE: (id: string | number) => `/v1/contracts/${id}`,
  CONTRACT_BY_ID: (id: string | number) => `/v1/contracts/${id}`,
};

export class ContractRepositoryImpl implements IContractRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<Contract[]> {
    const response = await this.api.get<Contract[]>(
      CONTRACT_API_ROUTES.CONTRACT
    );
    return response.data || [];
  }

  async getById(id: string): Promise<Contract> {
    const response = await this.api.get<Contract>(
      CONTRACT_API_ROUTES.CONTRACT_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateContractDto): Promise<Contract> {
    const response = await this.api.post<Contract>(
      CONTRACT_API_ROUTES.CONTRACT,
      data
    );
    return response.data;
  }

  async update(data: UpdateContractDto): Promise<Contract> {
    const response = await this.api.put<Contract>(
      CONTRACT_API_ROUTES.CONTRACT_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      CONTRACT_API_ROUTES.CONTRACT_DELETE(id)
    );
  }
}
