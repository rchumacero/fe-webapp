export interface Secret {
  id: number;
  code: string;
  name: string;
  description: string | null;
  value: string;
  vendorCode: string;
}

export interface CreateSecretDto {
  code: string;
  name: string;
  description?: string | null;
  value: string;
  vendorCode: string;
}

export interface UpdateSecretDto extends Partial<CreateSecretDto> {
  id: number;
}
