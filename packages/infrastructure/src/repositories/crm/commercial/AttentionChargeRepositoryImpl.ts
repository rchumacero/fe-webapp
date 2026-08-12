import { createApiClient } from "../../../api/client";
import { 
  AttentionCharge, 
  CreateAttentionChargeDto, 
  UpdateAttentionChargeDto,
  IAttentionChargeRepository 
} from "@kplian/core";

export const ATTENTION_CHARGE_API_ROUTES = {
  ATTENTION_CHARGE: '/v1/attention-charges',
  ATTENTION_CHARGE_UPDATE: (id: string | number) => `/v1/attention-charges/${id}`,
  ATTENTION_CHARGE_DELETE: (id: string | number) => `/v1/attention-charges/${id}`,
  ATTENTION_CHARGE_BY_ID: (id: string | number) => `/v1/attention-charges/${id}`,
};

export class AttentionChargeRepositoryImpl implements IAttentionChargeRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<AttentionCharge[]> {
    const response = await this.api.get<AttentionCharge[]>(
      ATTENTION_CHARGE_API_ROUTES.ATTENTION_CHARGE
    );
    return response.data || [];
  }

  async getById(id: string): Promise<AttentionCharge> {
    const response = await this.api.get<AttentionCharge>(
      ATTENTION_CHARGE_API_ROUTES.ATTENTION_CHARGE_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateAttentionChargeDto): Promise<AttentionCharge> {
    const response = await this.api.post<AttentionCharge>(
      ATTENTION_CHARGE_API_ROUTES.ATTENTION_CHARGE,
      data
    );
    return response.data;
  }

  async update(data: UpdateAttentionChargeDto): Promise<AttentionCharge> {
    const response = await this.api.put<AttentionCharge>(
      ATTENTION_CHARGE_API_ROUTES.ATTENTION_CHARGE_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      ATTENTION_CHARGE_API_ROUTES.ATTENTION_CHARGE_DELETE(id)
    );
  }
}
