import { createApiClient } from "@kplian/infrastructure";
import { WorkExperience, CreateWorkExperienceDto, UpdateWorkExperienceDto } from "../../domain/entities/WorkExperience";
import { WORK_EXPERIENCE_API_ROUTES } from "../../routes/work-experience-routes";

export class WorkExperienceRepositoryImpl {
  private api = createApiClient('crm');

  async getAllByPersonId(personId: string): Promise<WorkExperience[]> {
    const response = await this.api.get<WorkExperience[]>(
      WORK_EXPERIENCE_API_ROUTES.WORK_EXPERIENCE_BY_PERSON_ID(personId)
    );
    return response.data || [];
  }

  async getById(id: string): Promise<WorkExperience> {
    const response = await this.api.get<WorkExperience>(
      WORK_EXPERIENCE_API_ROUTES.WORK_EXPERIENCE_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreateWorkExperienceDto): Promise<WorkExperience> {
    const response = await this.api.post<WorkExperience>(
      WORK_EXPERIENCE_API_ROUTES.WORK_EXPERIENCE,
      data
    );
    return response.data;
  }

  async update(data: UpdateWorkExperienceDto): Promise<WorkExperience> {
    const response = await this.api.put<WorkExperience>(
      WORK_EXPERIENCE_API_ROUTES.WORK_EXPERIENCE_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      WORK_EXPERIENCE_API_ROUTES.WORK_EXPERIENCE_DELETE(id)
    );
  }
}
