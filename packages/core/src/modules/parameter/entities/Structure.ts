export interface Structure {
  id: string | number;
  code: string;
  name: string;
  parentId: string | number | null;
  isPrivate: number;
  companyCode?: string;
  moduleCode?: string;
}

export interface CreateStructureDto {
  code: string;
  name: string;
  parentId?: string | number | null;
  isPrivate?: number;
  companyCode?: string;
  moduleCode?: string;
}

export interface UpdateStructureDto extends Partial<CreateStructureDto> {
  id: string | number;
}
