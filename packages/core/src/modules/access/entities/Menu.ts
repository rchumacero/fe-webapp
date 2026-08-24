export interface MenuDto {
  readonly id: string;
  readonly appId: string;
  readonly appName?: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly status?: string;
  readonly createdAt?: string;
  readonly createdBy?: string;
  readonly updatedAt?: string;
  readonly updatedBy?: string;
}

export interface Menu {
  readonly id: string;
  readonly appId: string;
  readonly appName?: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly status?: string;
}

export const mapMenuDto = (dto: MenuDto): Menu => ({
  id: dto.id,
  appId: dto.appId,
  appName: dto.appName,
  code: dto.code,
  name: dto.name,
  description: dto.description,
  status: dto.status,
});
