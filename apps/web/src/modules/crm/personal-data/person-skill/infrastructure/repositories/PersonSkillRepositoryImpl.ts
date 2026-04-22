import { createApiClient } from "@kplian/infrastructure";
import { PersonSkill, CreatePersonSkillDto, UpdatePersonSkillDto } from "../../domain/entities/PersonSkill";
import { PersonSkillRepository } from "../../domain/repositories/PersonSkillRepository";
import { PERSON_SKILL_API_ROUTES } from "../../routes/person-skill-routes";

export class PersonSkillRepositoryImpl implements PersonSkillRepository {
  private api = createApiClient('crm');

  async getAllByPersonId(personId: string): Promise<PersonSkill[]> {
    const response = await this.api.get<PersonSkill[]>(
      PERSON_SKILL_API_ROUTES.PERSON_SKILL_BY_PERSON_ID(personId)
    );
    return response.data;
  }

  async getById(id: string): Promise<PersonSkill> {
    const response = await this.api.get<PersonSkill>(
      PERSON_SKILL_API_ROUTES.PERSON_SKILL_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreatePersonSkillDto): Promise<PersonSkill> {
    const response = await this.api.post<PersonSkill>(
      PERSON_SKILL_API_ROUTES.PERSON_SKILL,
      data
    );
    return response.data;
  }

  async update(data: UpdatePersonSkillDto): Promise<PersonSkill> {
    const response = await this.api.put<PersonSkill>(
      PERSON_SKILL_API_ROUTES.PERSON_SKILL_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      PERSON_SKILL_API_ROUTES.PERSON_SKILL_DELETE(id)
    );
  }
}
