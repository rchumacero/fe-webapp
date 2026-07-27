export interface DomainParameter {
  fullCode: string;
  vendorCode?: string;
  filter?: string;
}

export interface ParameterResponseItem {
  fullCode: string;
  [key: string]: any;
}

export type MappedParameters = Record<string, any>;

export interface Parameter {
  id: string | number;
  code: string;
  name: string;
  description: string | null;
  type: string;
  structureId: string | number;
  fullCode: string;
}

export interface CreateParameterDto {
  code: string;
  name: string;
  description?: string | null;
  type: string;
  structureId: string | number;
  fullCode: string;
}

export interface UpdateParameterDto extends Partial<CreateParameterDto> {
  id: string | number;
}
