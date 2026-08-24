import { createApiClient } from "@kplian/infrastructure";
import { Contact, CreateContactDto, UpdateContactDto } from "../../domain/entities/Contact";
import { CONTACT_API_ROUTES } from "../../routes/contact-routes";

export class ContactRepositoryImpl {
  private api = createApiClient('crm');

  async getAllByPersonId(personId: string): Promise<Contact[]> {
    const response = await this.api.get<Contact[]>(
      CONTACT_API_ROUTES.CONTACT_BY_PERSON_ID(personId)
    );
    return response.data || [];
  }

  async getById(id: string): Promise<Contact> {
    const response = await this.api.get<Contact>(
      CONTACT_API_ROUTES.CONTACT_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateContactDto): Promise<Contact> {
    const response = await this.api.post<Contact>(
      CONTACT_API_ROUTES.CONTACT,
      data
    );
    return response.data;
  }

  async update(data: UpdateContactDto): Promise<Contact> {
    const response = await this.api.put<Contact>(
      CONTACT_API_ROUTES.CONTACT_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      CONTACT_API_ROUTES.CONTACT_DELETE(id)
    );
  }
}
