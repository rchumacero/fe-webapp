export interface PersonSkill {
  id: string;
  personId: string;
  skillCode: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreatePersonSkillDto {
  personId: string;
  skillCode: string;
}

export interface UpdatePersonSkillDto extends CreatePersonSkillDto {
  id: string;
}
