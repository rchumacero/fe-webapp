export interface ProfileDto {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly moduleCode: string;
  readonly vendorCode?: string;
  readonly status?: string;
  readonly createdAt?: string;
  readonly createdBy?: string;
  readonly updatedAt?: string;
  readonly updatedBy?: string;
}

export interface Profile {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly moduleCode: string;
  readonly vendorCode?: string;
  readonly status?: string;
}

export const mapProfileDto = (dto: ProfileDto): Profile => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  moduleCode: dto.moduleCode,
  vendorCode: dto.vendorCode,
  status: dto.status,
});
