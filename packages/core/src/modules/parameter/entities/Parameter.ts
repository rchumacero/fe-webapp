export interface DomainParameter {
  fullCode: string;
  vendorCode: string;
  filter?: string;
}

export interface ParameterResponseItem {
  fullCode: string;
  [key: string]: any;
}

export type MappedParameters = Record<string, any>;
