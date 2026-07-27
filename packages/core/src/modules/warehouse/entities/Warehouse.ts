export interface Warehouse {
  id: string;
  vendorCode?: string;
  code: string;
  name: string;
  type?: string;
  locationCode?: string;
  address?: string;
  costMethodCode?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateWarehouseDto {
  vendorCode?: string;
  code: string;
  name: string;
  type?: string;
  locationCode?: string;
  address?: string;
  costMethodCode?: string;
}

export interface UpdateWarehouseDto extends Partial<CreateWarehouseDto> {
  id: string;
}
