export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignDto {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {
  id: string;
}
