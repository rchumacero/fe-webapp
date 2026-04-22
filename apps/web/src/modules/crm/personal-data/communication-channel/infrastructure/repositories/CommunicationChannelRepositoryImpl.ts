import { createApiClient } from "@kplian/infrastructure";
import { CommunicationChannel, CreateCommunicationChannelDto, UpdateCommunicationChannelDto } from "../../domain/entities/CommunicationChannel";
import { COMMUNICATION_CHANNEL_API_ROUTES } from "../../routes/communication-channel-routes";

export class CommunicationChannelRepositoryImpl {
  private api = createApiClient('crm');

  async getAllByPersonId(personId: string): Promise<CommunicationChannel[]> {
    const response = await this.api.get<CommunicationChannel[]>(
      COMMUNICATION_CHANNEL_API_ROUTES.COMMUNICATION_CHANNEL_BY_PERSON_ID(personId)
    );
    return response.data || [];
  }

  async getById(id: string): Promise<CommunicationChannel> {
    const response = await this.api.get<CommunicationChannel>(
      COMMUNICATION_CHANNEL_API_ROUTES.COMMUNICATION_CHANNEL_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateCommunicationChannelDto): Promise<CommunicationChannel> {
    const response = await this.api.post<CommunicationChannel>(
      COMMUNICATION_CHANNEL_API_ROUTES.COMMUNICATION_CHANNEL,
      data
    );
    return response.data;
  }

  async update(data: UpdateCommunicationChannelDto): Promise<CommunicationChannel> {
    const response = await this.api.put<CommunicationChannel>(
      COMMUNICATION_CHANNEL_API_ROUTES.COMMUNICATION_CHANNEL_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      COMMUNICATION_CHANNEL_API_ROUTES.COMMUNICATION_CHANNEL_DELETE(id)
    );
  }
}
