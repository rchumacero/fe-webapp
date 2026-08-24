import { PersonSkill, CreatePersonSkillDto, UpdatePersonSkillDto } from "../entities/PersonSkill";

export interface PersonSkillRepository {
  getAllByPersonId(personId: string): Promise<PersonSkill[]>;
  getById(id: string): Promise<PersonSkill>;
  create(data: CreatePersonSkillDto): Promise<PersonSkill>;
  update(data: UpdatePersonSkillDto): Promise<PersonSkill>;
  delete(id: string): Promise<void>;
}
