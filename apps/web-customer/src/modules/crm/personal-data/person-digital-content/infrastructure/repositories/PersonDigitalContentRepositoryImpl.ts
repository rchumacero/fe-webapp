import { createApiClient } from "@kplian/infrastructure";
import { PersonDigitalContent, CreatePersonDigitalContentDto, UpdatePersonDigitalContentDto } from "../../domain/entities/PersonDigitalContent";
import { PERSON_DIGITAL_CONTENT_API_ROUTES } from "../../routes/person-digital-content-routes";

export class PersonDigitalContentRepositoryImpl {
  private api = createApiClient('crm');

  async getAllByPersonId(personId: string): Promise<PersonDigitalContent[]> {
    const response = await this.api.get<PersonDigitalContent[]>(
      PERSON_DIGITAL_CONTENT_API_ROUTES.PERSON_DIGITAL_CONTENT_BY_PERSON_ID(personId)
    );
    return response.data || [];
  }

  async getById(id: string): Promise<PersonDigitalContent> {
    const response = await this.api.get<PersonDigitalContent>(
      PERSON_DIGITAL_CONTENT_API_ROUTES.PERSON_DIGITAL_CONTENT_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreatePersonDigitalContentDto): Promise<PersonDigitalContent> {
    const response = await this.api.post<PersonDigitalContent>(
      PERSON_DIGITAL_CONTENT_API_ROUTES.PERSON_DIGITAL_CONTENT,
      data
    );
    return response.data;
  }

  async update(data: UpdatePersonDigitalContentDto): Promise<PersonDigitalContent> {
    const response = await this.api.put<PersonDigitalContent>(
      PERSON_DIGITAL_CONTENT_API_ROUTES.PERSON_DIGITAL_CONTENT_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      PERSON_DIGITAL_CONTENT_API_ROUTES.PERSON_DIGITAL_CONTENT_DELETE(id)
    );
  }
}
