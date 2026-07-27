export interface ParameterValue {
  id: string | number;
  value: string;
  dataType: string;
  row: number;
  variableId: string | number;
  vendorCode: string;
}

export interface CreateParameterValueDto {
  value: string;
  dataType: string;
  row?: number;
  variableId: string | number;
  vendorCode: string;
}

export interface UpdateParameterValueDto extends Partial<CreateParameterValueDto> {
  id: string | number;
}
