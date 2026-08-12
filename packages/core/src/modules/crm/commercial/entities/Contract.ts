export class Contract {
  id!: string;
  campaignId!: string;
  customerId!: string;
  digitalContentCode?: string | null;
  order?: number | null;
}

export interface CreateContractDto {
  campaignId: string;
  customerId: string;
  digitalContentCode?: string | null;
  order?: number | null;
}

export interface UpdateContractDto extends Partial<CreateContractDto> {
  id: string;
}
