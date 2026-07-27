export interface Variable {
  id: string | number;
  code: string;
  name: string;
  type: string;
  columnOrder: string | null;
  parameterId: string | number;
  primaryKey: number;
  display: number;
}

export interface CreateVariableDto {
  code: string;
  name: string;
  type: string;
  columnOrder?: string | null;
  parameterId: string | number;
  primaryKey?: number;
  display?: number;
}

export interface UpdateVariableDto extends Partial<CreateVariableDto> {
  id: string | number;
}
