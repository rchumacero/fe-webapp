export interface EconomicActivity {
  id: string;
  personId: string;
  paramEconomicActCode: string;
  type: string;
  priority: number | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateEconomicActivityDto {
  personId: string;
  paramEconomicActCode: string;
  type: string;
  priority?: number | null;
}

export interface UpdateEconomicActivityDto extends CreateEconomicActivityDto {
  id: string;
}
