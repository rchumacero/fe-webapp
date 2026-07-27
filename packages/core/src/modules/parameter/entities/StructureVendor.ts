export interface StructureVendor {
  id: string | number;
  structureId: string | number;
  vendorCode: string;
  status: string;
}

export interface CreateStructureVendorDto {
  structureId: string | number;
  vendorCode: string;
  status: string;
}

export interface UpdateStructureVendorDto extends Partial<CreateStructureVendorDto> {
  id: string | number;
}
