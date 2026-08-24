export interface ResourceDto {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly type: string;
  readonly restricted: boolean;
  readonly endpoint?: string;
  readonly resourceId?: string;
  readonly moduleCode: string;
  readonly menuId?: string;
  readonly status?: string;
  readonly createdAt?: string;
  readonly createdBy?: string;
  readonly updatedAt?: string;
  readonly updatedBy?: string;
}

export interface Resource {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly type: string;
  readonly restricted: boolean;
  readonly endpoint?: string;
  readonly resourceId?: string;
  readonly moduleCode: string;
  readonly menuId?: string;
  readonly status?: string;
}

export const mapResourceDto = (dto: ResourceDto): Resource => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  description: dto.description,
  type: dto.type,
  restricted: dto.restricted,
  endpoint: dto.endpoint,
  resourceId: dto.resourceId,
  moduleCode: dto.moduleCode,
  menuId: dto.menuId,
  status: dto.status,
});
