export interface AppDto {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly status?: string;
  readonly createdAt?: string;
  readonly createdBy?: string;
  readonly updatedAt?: string;
  readonly updatedBy?: string;
}

export interface App {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly status?: string;
}

export const mapAppDto = (dto: AppDto): App => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  description: dto.description,
  status: dto.status,
});
